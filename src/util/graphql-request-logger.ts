import chalk from 'chalk'
export default {
  requestDidStart(requestContext: any) {
    console.log('Request started! Query:\n' + chalk.yellow(requestContext.request.query))
  },
}
