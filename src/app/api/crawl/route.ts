import seed from './seed'
import { NextResponse } from 'next/server';
import { ServerlessSpecCloudEnum } from '@pinecone-database/pinecone'

export const runtime = 'edge'

export async function POST(req: Request) {

  const { url } = await req.json()
  try {
    const documents = await seed(
      url,
      1,
      "estentoai",
      'aws',
      'us-east-1',
    )
    return NextResponse.json({ success: true, documents })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed crawling" })
  }
}