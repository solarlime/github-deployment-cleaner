import { FormEvent } from 'react';
import { ReactComponent as Logo } from './assets/logo.svg';
import styles from './App.module.css';

function Form() {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log(event.target);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="repo" placeholder="Fill in your repository name" required={true}></input>
      <input type="text" name="user" placeholder="Fill in your GitHub username" required={true}></input>
      <input type="text" name="token" placeholder="Fill in your GitHub token" required={true}></input>
      <button type="submit">
        Clean repository deployments
      </button>
    </form>
  );
}

function App() {
  return (
    <main className={styles.main}>
      <div className={styles.logo}>
        <a href="https://github.com/solarlime/github-deployment-cleaner/" target="_blank">
          <Logo className={styles.logo__svg} />
        </a>
      </div>
      <h1>GitHub Deployment Cleaner</h1>
      <p className={styles.description}>
        This service helps to clean up repository deployments. It is possible to do it manually with the GitHub API. However, this one is simpler.
      </p>
      <Form/>
      <div className={styles.help}>
        <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank">
          How you can get a GitHub token
        </a>
      </div>
    </main>
  );
}

export default App
