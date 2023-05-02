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
  rest.get(url, (req, res, ctx) => res(ctx.json(deployments))),
  rest.post(`${url}/:id/statuses`, (req, res, ctx) => res(ctx.json({ success: true }))),
  rest.delete(`${url}/:id`, (req, res, ctx) => res(ctx.json({ success: true }))),
);

beforeAll(() => server.listen());

// Reset handlers so that each test could alter them
// without affecting other, unrelated tests.
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Testing App component', () => {
  test('Initial load', async () => {
    const { getByText } = render(<App />);
    expect(getByText('GitHub Deployment Cleaner')).toBeInTheDocument();
  });

  test('Successful cleaning', async () => {
    const { getByPlaceholderText, getByRole } = render(<App />);
    const repoInput = getByPlaceholderText('Fill in your repository name');
    const userInput = getByPlaceholderText('Fill in your GitHub username');
    const tokenInput = getByPlaceholderText('Fill in your GitHub token');
    const user = userEvent.setup();
    await user.type(userInput, 'user');
    await user.type(repoInput, 'repo');
    await user.type(tokenInput, 'token');
    const button = getByRole('button', { name: 'Clean repository deployments' });
    await user.click(button);
    await waitFor(() => {
      expect(button).toHaveTextContent('Deleted 2 deployments!');
    });
  });
});
