import { useState, useEffect } from 'react'
import { Profile } from './[username]'
import useForm from '../lib/use-form'
import { isEmpty, capitalize } from 'lodash'

export default () => {
  const [username, setUsername] = useState('lachlanjc')
  const [user, setUser] = useState({})
  const [colors, setColors] = useState({
    text: 'var(--colors-black)',
    background: 'var(--colors-snow)',
    elevated: 'var(--colors-white)',
    sunken: 'var(--colors-smoke)'
  })
  const [css, setCss] = useState('')
  const { data, useField } = useForm('')

  useEffect(() => {
    fetch('/api/users/lachlanjc')
      .then(r => r.json())
      .then(u => setUser(u))
  }, [])

  useEffect(
    () => {
      if (!isEmpty(data.username) && data.username !== username) {
        setUsername(data.username)
        const u = fetch(`/api/users/${data.username}`).then(r => r.json())
        setUser(u)
      }
    },
    [data]
  )

  useEffect(
    () => {
      setCss(
        Object.keys(data).map(
          c => `
      --colors-${c}: ${colors[c]} !importat;`
        )
      )
    },
    [colors]
  )

  return (
    <main>
      <Profile {...user}>
        <style>{`
          :root {${css}
          }
        `}</style>
      </Profile>
      <aside>
        <form>
          <label>
            Username (for previewing your profile)
            <input {...useField('username')} />
          </label>
          <h2>Colors</h2>
          {Object.keys(colors).map(c => (
            <label key={c}>
              {capitalize(c)}
              <input {...useField(c, 'text', colors[c])} />
            </label>
          ))}
        </form>
      </aside>
      <style jsx>{`
        main {
          display: grid;
          grid-template-columns: 7fr 3fr;
        }
        aside {
          backgroud-color: var(--colors-elevated);
        }
        label {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </main>
  )
}
