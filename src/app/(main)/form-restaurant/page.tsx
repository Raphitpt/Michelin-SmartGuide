import { getRecoDimensions } from '../../../components/formRestaurant/actions'
import FormClient from '../../../components/formRestaurant/formClient'

export default async function Page() {
  const questions = await getRecoDimensions()

  return (
    <>
      <FormClient questions={questions} />
    </>
  )
}