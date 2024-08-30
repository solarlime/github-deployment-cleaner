import { http } from 'msw';
import { setupServer } from 'msw/node';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../src/App';

const url = 'https://api.github.com/repos/user/repo/deployments';
const deployments = [{ id: 123 }, { id: 456 }];
const server = setupServer(
  http.get(url, () => new Response(JSON.stringify(deployments), {
    headers: {
      'Content-Type': 'application/json',
    },
  })),
  http.post(`${url}/:id/statuses`, async ({ request }) => {
    const headers = await request.headers;
    if (headers.get('authorization')?.includes('notmytoken')) {
      return new Response(JSON.stringify('Not found'), {
        status: 404,
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
  // @ts-ignore
  http.delete(`${url}/:id`, () => new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
    },
  })),
);

beforeAll(() => server.listen());

// Reset handlers so that each test could alter them
// without affecting other, unrelated tests.
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('Initial load', async () => {
  const { getByText } = render(<App />);
  expect(getByText('GitHub Deployment Cleaner')).toBeInTheDocument();
});

test('Parsing URL', async () => {
  const { getByPlaceholderText } = render(<App />);
  const repoInput = getByPlaceholderText('Fill in your repository name');
  const userInput = getByPlaceholderText('Fill in your GitHub username');
  const user = userEvent.setup();
  await user.click(repoInput);
  await user.paste('https://github.com/user/repo/something_else');
  expect(repoInput).toHaveValue('repo');
  expect(userInput).toHaveValue('user');

  await user.clear(repoInput);
  await user.clear(userInput);

  await user.click(userInput);
  await user.paste('https://github.com/loser/repo/something_else');
  expect(repoInput).toHaveValue('repo');
  expect(userInput).toHaveValue('loser');
});

describe.each`
  gitUser    | repo      | token           | time | expected
  ${'user'}  | ${'repo'} | ${'notmytoken'} | ${1} | ${'Access denied!'}  
  ${'loser'} | ${'repo'} | ${'token'}      | ${1} | ${'Incorrect credentials!'}
  ${'user'}  | ${'repo'} | ${'token'}      | ${1} | ${'Deleted 2 deployments!'}
  ${'user'}  | ${'repo'} | ${'token'}      | ${2} | ${'No deployments found!'}
`('$expected', ({
  gitUser, repo, token, time, expected,
}) => {
  test('Testing App component', async () => {
    const { getByPlaceholderText, getByRole } = render(<App />);
    const repoInput = getByPlaceholderText('Fill in your repository name');
    const userInput = getByPlaceholderText('Fill in your GitHub username');
    const tokenInput = getByPlaceholderText('Fill in your GitHub token');
    const user = userEvent.setup();
    await user.type(userInput, gitUser);
    await user.type(repoInput, repo);
    await user.type(tokenInput, token);
    const button = getByRole('button', { name: 'Clean repository deployments' });
    if (time === 2) {
      server.use(
        http.get(url, () => new Response(JSON.stringify([]), {
          headers: {
            'Content-Type': 'application/json',
          },
        }), { once: true }),
      );
    }
    await user.click(button);
    await waitFor(() => {
      expect(button).toHaveTextContent(expected);
    });
    if (time === 2) {
      await user.type(userInput, '!');
      expect(repoInput).toHaveValue('');
    }
  });
});
