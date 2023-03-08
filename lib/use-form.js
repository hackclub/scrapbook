import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const useForm = (
  submitURL = '/',
  options = { clearOnSubmit: 5000, method: 'POST', initData: {} }
) => {
  const [status, setStatus] = useState('default')
  const [data, setData] = useState({ ...options.initData })
  const [touched, setTouched] = useState({})

  const onFieldChange = (e, name, type) => {
    e.persist()
    const value = e.target[type === 'checkbox' ? 'checked' : 'value']
    setData(data => ({ ...data, [name]: value || '' }))
  }

  const setDataValue = (name, value) => {
    setData(data => ({ ...data, [name]: value || '' }))
  }

  useEffect(() => {
    setTouched(Object.keys(data))
  }, [data])

  const useField = (name, type = 'text', ...props) => {
    const checkbox = type === 'checkbox'
    const empty = checkbox ? false : ''
    const onChange = e => onFieldChange(e, name, type)
    const value = data[name]
    return {
      name,
      type: name === 'email' ? 'email' : type,
      [checkbox ? 'checked' : 'value']: value || empty,
      onChange,
      ...props
    }
  }

  const { method = 'POST' } = options
  const action = submitURL

  const submit = (name, value) => {
    setStatus('submitting')
    const toastId = toast.loading('Waiting...')
    fetch(action, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(name ? { ...data, [name]: value || '' } : data)
    })
      .then(r => r.json())
      .then(r => {
        if (r.error) {
          throw new Error('Server-side error.')
        }
        setStatus('success')
        toast.dismiss(toastId)
        toast.success(options.success || 'Successfully updated!')
        if (options.closingAction) {
          options.closingAction()
        }
        if (r.callback) {
          options.router?.push(r.callback)
        }
        setTimeout(() => setStatus('default'), 3500)
        if (options.clearOnSubmit) {
          setTimeout(() => setData({}), options.clearOnSubmit)
        }
      })
      .catch(e => {
        console.error(e)
        setStatus('error')
        toast.dismiss(toastId)
        toast.error(
          options.error || 'An unexpected error occured - please try again.'
        )
      })
  }

  return { status, data, touched, useField, setData, setDataValue, submit }
}

export default useForm
