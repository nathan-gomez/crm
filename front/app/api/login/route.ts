import { NextResponse } from 'next/server'
import axios from '@/utils/axiosConfig';
import { LoginResponse } from '@/models/ApiResponse';
import getErrorMessage from '@/utils/errorHandler';

type Body = {
  username: string;
  password: string;
}

export async function POST(req: NextResponse<Body>) {
  const body: Body = await req.json();

  try {
    const url = process.env.API_LOGIN

    if (!url) {
      throw new Error('Env API_LOGIN not defined')
    }

    const response = await axios.post<LoginResponse>(url, body, {
      headers: {
        'x-api-key': process.env.API_KEY
      }
    })

    if (response.status === 204) {
      return new Response(null, { status: response.status })
    }

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }

}