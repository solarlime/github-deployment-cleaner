import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

test('Initial load', async () => {
  const { getByText } = render(<App />);
  expect(getByText('GitHub Deployment Cleaner')).toBeInTheDocument();
});
