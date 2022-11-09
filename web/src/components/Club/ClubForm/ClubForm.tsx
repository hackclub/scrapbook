import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'

import type { EditClubById, UpdateClubInput } from 'types/graphql'
import type { RWGqlError } from '@redwoodjs/forms'




type FormClub = NonNullable<EditClubById['club']>

interface ClubFormProps {
  club?: EditClubById['club']
  onSave: (data: UpdateClubInput, id?: FormClub['id']) => void
  error: RWGqlError
  loading: boolean
}

const ClubForm = (props: ClubFormProps) => {
  const onSubmit = (data: FormClub) => {
  
    
    
  
    
    
  
    
    
  
    
    
  
    
    
  
    
    
  
    
    
  
    props.onSave(data, props?.club?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form<FormClub> onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />
      
        <Label
          name="slug"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Slug
        </Label>
        
          <TextField
            name="slug"
            defaultValue={props.club?.slug}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{ required: true }}
          />
        

        <FieldError name="slug" className="rw-field-error" />

        <Label
          name="name"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Name
        </Label>
        
          <TextField
            name="name"
            defaultValue={props.club?.name}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{ required: true }}
          />
        

        <FieldError name="name" className="rw-field-error" />

        <Label
          name="logo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Logo
        </Label>
        
          <TextField
            name="logo"
            defaultValue={props.club?.logo}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
            validation={{ required: true }}
          />
        

        <FieldError name="logo" className="rw-field-error" />

        <Label
          name="customDomain"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Custom domain
        </Label>
        
          <TextField
            name="customDomain"
            defaultValue={props.club?.customDomain}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
        

        <FieldError name="customDomain" className="rw-field-error" />

        <Label
          name="cssURL"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Css url
        </Label>
        
          <TextField
            name="cssURL"
            defaultValue={props.club?.cssURL}
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
            defaultValue={props.club?.website}
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
            defaultValue={props.club?.github}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
        

        <FieldError name="github" className="rw-field-error" />

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

export default ClubForm
