import type { EditUpdateById, UpdateUpdateInput } from 'types/graphql'

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  TextAreaField,
  SelectField,
  Submit,
  FileField,
} from '@redwoodjs/forms'
import type { RWGqlError } from '@redwoodjs/forms'

import { toast } from '@redwoodjs/web/toast'

import { useAuth } from '@redwoodjs/auth'

type FormUpdate = NonNullable<EditUpdateById['update']>

interface UpdateFormProps {
  update?: EditUpdateById['update']
  onSave: (data: UpdateUpdateInput, id?: FormUpdate['id']) => void
  error: RWGqlError
  loading: boolean
}

const UpdateForm = (props: UpdateFormProps) => {
  const onSubmit = (data: FormUpdate) => {
    toast.loading('Submitting & uploading your update...')
    props.onSave(data, props?.update?.id)
  }

  const { currentUser } = useAuth()

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
          How would you describe what you've made? Include technical details!
        </Label>

        <TextAreaField
          name="text"
          defaultValue={props.update?.text}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="text" className="rw-field-error" />
        {!props.update && (
          <>
            {currentUser.clubs.length > 0 && (
              <>
                <Label
                  name="clubSlug"
                  className="rw-label"
                  errorClassName="rw-label rw-label-error"
                >
                  Did you make this in your club? If so, awesome! Select it
                  here.
                </Label>

                <SelectField
                  name="clubSlug"
                  defaultValue={props.update?.text}
                  className="rw-input"
                  errorClassName="rw-input rw-input-error"
                >
                  <option disabled selected>
                    Click to select a club.
                  </option>
                  {[
                    ...new Map(
                      currentUser.clubs.map((c) => [c.club.slug, c])
                    ).values(),
                  ].map((club) => (
                    <option value={club.club.slug}>{club.club.name}</option>
                  ))}
                </SelectField>
                <FieldError name="clubSlug" className="rw-field-error" />
              </>
            )}
            <Label
              name="attachments"
              className="rw-label"
              errorClassName="rw-label rw-label-error"
            >
              Attachments
            </Label>

            <FileField name="img" accept="image/* video/*" />
            <FieldError name="attachments" className="rw-field-error" />
          </>
        )}

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default UpdateForm
