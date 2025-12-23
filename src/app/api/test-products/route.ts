import { NextResponse } from 'next/server';
import { getProducts } from '@/services/supabase';

export async function GET(request: Request) {
  try {
    const { data, error } = await getProducts({ limit: 5 });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}