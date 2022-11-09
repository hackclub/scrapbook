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
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />
      
        <Label
          name="accountId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Account id
        </Label>
        
          <NumberField
            name="accountId"
            defaultValue={props.clubMember?.accountId}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{ required: true }}
          />
        

        <FieldError name="accountId" className="rw-field-error" />

        <Label
          name="clubId"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Club id
        </Label>
        
          <TextField
            name="clubId"
            defaultValue={props.clubMember?.clubId}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{ required: true }}
          />
        

        <FieldError name="clubId" className="rw-field-error" />

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

export default ClubMemberForm
