import { Amplify } from 'aws-amplify'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const userPoolId = config.public.cognitoUserPoolId as string
  const userPoolClientId = config.public.cognitoClientId as string
  const region = (config.public.cognitoRegion as string) || 'ap-northeast-1'

  if (!userPoolId || !userPoolClientId) {
    return
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          email: true,
        },
      },
    },
  })
})
