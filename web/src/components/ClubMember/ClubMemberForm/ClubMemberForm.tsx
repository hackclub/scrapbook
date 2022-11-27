import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  TextField,
  Submit,
} from '@redwoodjs/forms'

import type { EditClubMemberById, UpdateClubMemberInput } from 'types/graphql'
import type { RWGqlError } from '@redwoodjs/forms'

type FormClubMember = NonNullable<EditClubMemberById['clubMember']>

interface ClubMemberFormProps {
  clubMember?: EditClubMemberById['clubMember']
  onSave: (data: UpdateClubMemberInput, id?: FormClubMember['id']) => void
  error: RWGqlError
  loading: boolean
}

const ClubMemberForm = (props: ClubMemberFormProps) => {
  const onSubmit = (data: FormClubMember) => {
    props.onSave(data, props?.clubMember?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormClubMember> onSubmit={onSubmit} error={props.error}>
        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ClubMemberForm
