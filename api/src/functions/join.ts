import { db } from 'src/lib/db'
import { getCurrentUser } from 'src/lib/auth'
import { useAuth } from '@redwoodjs/auth'

import type { APIGatewayEvent } from 'aws-lambda'

function parseCookies(header){
  var pairs = header.split(';');
  var cookies = {};
for (var i = 0; i < pairs.length; i++) {
   var nameValue = pairs[i].split('=');
   cookies[nameValue[0].trim()] = nameValue[1];
}
return cookies
}

export async function handler(req: APIGatewayEvent, res){
  console.log(useAuth())
  console.log(context.currentUser)
  
return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: '${name} function',
    }),
  }
}