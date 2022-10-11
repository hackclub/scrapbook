import type { EditAccountById, UpdateAccountInput } from 'types/graphql'

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import type { RWGqlError } from '@redwoodjs/forms'

type FormAccount = NonNullable<EditAccountById['account']>

interface AccountFormProps {
  account?: EditAccountById['account']
  onSave: (data: UpdateAccountInput, id?: FormAccount['id']) => void
  error: RWGqlError
  loading: boolean
}

const AccountForm = (props: AccountFormProps) => {
  const onSubmit = (data: FormAccount) => {
    props.onSave(data, props?.account?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormAccount> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="email"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Email
        </Label>

        <TextField
          name="email"
          defaultValue={props.account?.email}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="email" className="rw-field-error" />

        <Label
          name="username"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Username
        </Label>

        <TextField
          name="username"
          defaultValue={props.account?.username}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="username" className="rw-field-error" />

        <Label
          name="timezone"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Timezone
        </Label>

        <TextField
          name="timezone"
          defaultValue={props.account?.timezone}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="timezone" className="rw-field-error" />

        <Label
          name="customDomain"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Custom domain
        </Label>

        <TextField
          name="customDomain"
          defaultValue={props.account?.customDomain}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="customDomain" className="rw-field-error" />

        <Label
          name="cssURL"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          CSS URL
        </Label>

        <TextField
          name="cssURL"
          defaultValue={props.account?.cssURL}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="cssURL" className="rw-field-error" />

        <Label
          name="website"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Website
        </Label>

        <TextField
          name="website"
          defaultValue={props.account?.website}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="website" className="rw-field-error" />

        <Label
          name="github"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Github
        </Label>

        <TextField
          name="github"
          defaultValue={props.account?.github}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="github" className="rw-field-error" />

        <Label
          name="pronouns"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Pronouns
        </Label>

        <TextField
          name="pronouns"
          defaultValue={props.account?.pronouns}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="pronouns" className="rw-field-error" />

        <Label
          name="customAudioURL"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Custom Audio URL
        </Label>

        <TextField
          name="customAudioURL"
          defaultValue={props.account?.customAudioURL}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="customAudioURL" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default AccountForm
