import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';
import App from '../src/App';

const url = 'https://api.github.com/repos/user/repo/deployments';
const deployments = [{ id: 123 }, { id: 456 }];
const server = setupServer(
  // @ts-ignore
  rest.get(url, (req, res, ctx) => res(ctx.json(deployments))),
  rest.post(`${url}/:id/statuses`, (req, res, ctx) => {
    if (req.headers.get('authorization')?.includes('notmytoken')) {
      return res(ctx.status(404), ctx.body('Not found'));
    }
    return res(ctx.json({ success: true }));
  }),
  // @ts-ignore
  rest.delete(`${url}/:id`, (req, res, ctx) => res(ctx.json({ success: true }))),
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
        // @ts-ignore
        rest.get(url, (req, res, ctx) => res.once(ctx.json([]))),
      );
    }
    console.log('Token:', token);
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
