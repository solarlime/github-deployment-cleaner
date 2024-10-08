import React, { useEffect, useRef, useState } from 'react';
import Logo from './assets/logo.svg?react';
import styles from './App.module.css';

interface FormCollection extends HTMLFormControlsCollection {
  user: HTMLInputElement, repo: HTMLInputElement, token: HTMLInputElement,
}

const initialFormState = {
  inputs: '',
  button: 'Clean repository deployments',
  colors: {},
  disabled: false,
};
Object.freeze(initialFormState);

// A form component
function Form() {
  // Used this ref because useEffect is triggered twice due to the development mode
  const isFirstRender = useRef(true);
  const formRef = useRef(null);
  const [credentials, setCredentials] = useState({ repo: '', user: '', token: '' });
  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    // useEffect shouldn't work on the first form render, only on the second. Fixed it with a ref
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (Object.values(credentials).some((value) => value === '')) {
      console.log('Looks like you are in a development mode!');
    } else {
      const url = `https://api.github.com/repos/${credentials.user}/${credentials.repo}/deployments`;
      const authHeader = `token ${credentials.token}`;

      // At first, we need to get a list of deployments
      const getDeploymentsList = async () => {
        const res = await fetch(`${url}`, { headers: { authorization: authHeader } });
        return res.json();
      };

      // Then — to disable them
      const disableDeployment = async (id: number) => {
        const res = await fetch(`${url}/${id}/statuses`, {
          method: 'POST',
          body: JSON.stringify({ state: 'inactive' }),
          headers: {
            'content-type': 'application/json',
            accept: 'application/vnd.github+json',
            authorization: authHeader,
          },
        });
        if (res.status === 404) {
          throw Error('Access denied!');
        }
        return id;
      };

      // After all — to delete them
      const deleteDeployment = async (id: number) => {
        await fetch(`${url}/${id}`, {
          method: 'DELETE',
          headers: { authorization: authHeader },
        });
        return id;
      };

      const main = async () => {
        const deployments = await getDeploymentsList();
        // Handling errors
        if (deployments.message && ['bad credentials', 'not found'].includes(deployments.message.toLowerCase())) {
          throw Error('Incorrect credentials!');
        }
        if (deployments.length === 0) {
          throw Error('No deployments found!');
        }
        const quantity = (array: Array<any>) => ((array.length === 1) ? 'deployment' : 'deployments');
        console.log(`Found ${deployments.length} ${quantity(deployments)}!`);

        const ids: Array<number> = deployments.map(({ id }: { id: number }) => id);
        try {
          const disabledDeployments = await Promise.all(ids.map((id) => disableDeployment(id)));
          console.log(`Disabled ${disabledDeployments.length} ${quantity(disabledDeployments)}!`);

          const deletedDeployments = await Promise.all(
            disabledDeployments.map((id) => deleteDeployment(id)),
          );
          console.log(`Deleted ${deletedDeployments.length} ${quantity(deletedDeployments)}!`);

          setFormState((previous) => (
            { ...previous, button: `Deleted ${deletedDeployments.length} ${quantity(deletedDeployments)}!`, disabled: true }
          ));
        } catch (e) {
          throw (e as Error);
        }
      };

      main().catch((e) => {
        console.error(e);
        setFormState((previous) => (
          {
            ...previous, button: (e.message) ? e.message : 'Error! Check the console', disabled: true, colors: { backgroundColor: 'crimson' },
          }
        ));
      }).finally(() => {
        // Whatever the result is, we need to add a handler to reset the form
        const formElement = formRef.current as unknown as HTMLFormElement;
        formElement.addEventListener('input', () => {
          setFormState(initialFormState);
          formElement.reset();
        }, { once: true });
      });
    }
  }, [credentials]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = document.forms[0].elements as FormCollection;
    // A trigger for useEffect
    setCredentials({ repo: form.repo.value, user: form.user.value, token: form.token.value });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.match('https://github.com/')) {
      // @ts-ignore
      const [user, repo, ...rest] = value.replace('https://github.com/', '').split('/');
      const form = document.forms[0].elements as FormCollection;
      if (repo && user) {
        form.repo.value = repo;
        form.user.value = user;
      }
    }
  };

  return (
    <form name="main-form" onSubmit={handleSubmit} ref={formRef}>
      <input
        type="text"
        name="repo"
        placeholder="Fill in your repository name"
        defaultValue={formState.inputs}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="user"
        placeholder="Fill in your GitHub username"
        defaultValue={formState.inputs}
        onChange={handleChange}
        required
      />
      <input type="text" name="token" placeholder="Fill in your GitHub token" defaultValue={formState.inputs} required />
      <button type="submit" style={formState.colors} disabled={formState.disabled}>{formState.button}</button>
    </form>
  );
}

// A main component
function App() {
  return (
    <main className={styles.main}>
      <div className={styles.logo}>
        <a href="https://github.com/solarlime/github-deployment-cleaner/" target="_blank" rel="noreferrer">
          <Logo className={styles.logo__svg} />
        </a>
      </div>
      <h1>GitHub Deployment Cleaner</h1>
      <p className={styles.description}>
        This service helps to clean up repository deployments.
        It is possible to do it manually with the GitHub API. However, this one is simpler.
      </p>
      <Form />
      <div className={styles.help}>
        <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank" rel="noreferrer">
          How you can get a GitHub token
        </a>
      </div>
    </main>
  );
}

export default App;
