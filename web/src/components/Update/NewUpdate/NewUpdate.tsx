import type { CreateUpdateInput } from 'types/graphql'
import { v4 as uuidv4 } from 'uuid'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import UpdateForm from 'src/components/Update/UpdateForm'
import S3 from 'src/utils/s3'

const CREATE_UPDATE_MUTATION = gql`
  mutation CreateUpdateMutation($input: CreateUpdateInput!) {
    createUpdate(input: $input) {
      id
    }
  }
`

const NewUpdate = () => {
  const { currentUser } = useAuth()

  const [createUpdate, { loading, error }] = useMutation(
    CREATE_UPDATE_MUTATION,
    {
      onCompleted: () => {
        toast.remove()
        toast.success('Update created')
        navigate(routes.home())
      },
      onError: (error) => {
        toast.remove()
        toast.error(error.message)
      },
    }
  )

  const uploadImage = async (file: File): Promise<string | void> => {
    let uploadedImage
    try {
      let key = `${uuidv4()}-${file.name}`
      uploadedImage = await S3.upload({
        Bucket: process.env.REDWOOD_ENV_S3_BUCKET_NAME,
        Key: key,
        Body: file,
      }).promise()
      // await S3.deleteObject({ Bucket: process.env.REDWOOD_ENV_S3_BUCKET_NAME, Key: key }).promise()
    } catch (e) {
      alert(
        `Failed to upload the file to the server! Please contact the maintainers to resolve this.`
      )
      console.error(e)
      return
    }
    return uploadedImage.Location
  }

  const onSave = async (input: CreateUpdateInput) => {
    console.log('server side!')
    const url = await uploadImage(input['img'][0])
    console.log(`New upload: ${url}`)
    input.attachments = [url as string]
    delete input['img']
    createUpdate({
      variables: { input: { accountID: currentUser.id, ...input } },
    })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Update</h2>
      </header>
      <div className="rw-segment-main">
        <UpdateForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewUpdate
