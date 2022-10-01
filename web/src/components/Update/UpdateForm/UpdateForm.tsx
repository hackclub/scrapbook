import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  DatetimeLocalField,
  CheckboxField,
  Submit,
} from '@redwoodjs/forms'

import type { EditUpdateById, UpdateUpdateInput } from 'types/graphql'
import type { RWGqlError } from '@redwoodjs/forms'



const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}


type FormUpdate = NonNullable<EditUpdateById['update']>

interface UpdateFormProps {
  update?: EditUpdateById['update']
  onSave: (data: UpdateUpdateInput, id?: FormUpdate['id']) => void
  error: RWGqlError
  loading: boolean
}

const UpdateForm = (props: UpdateFormProps) => {
  const onSubmit = (data: FormUpdate) => {








































    props.onSave(data, props?.update?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormUpdate> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="text"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Text
        </Label>

          <TextField
            name="text"
            defaultValue={props.update?.text}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />


        <FieldError name="text" className="rw-field-error" />

        <Label
          name="attachments"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Attachments
        </Label>

          <TextField
            name="attachments"
            defaultValue={props.update?.attachments}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{ required: true }}
          />


        <FieldError name="attachments" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit
            disabled={props.loading}
            className="rw-button rw-button-blue"
          >
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default UpdateForm
