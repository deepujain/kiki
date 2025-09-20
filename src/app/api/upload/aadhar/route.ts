import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const employeeName = formData.get('employeeName') as string;

    if (!file || !employeeName) {
      return NextResponse.json(
        { error: 'File and employee name are required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure the directory exists
    const aadharDir = path.join(process.cwd(), 'public', 'images', 'aadhar');
    
    // Create the filename
    const filename = `${employeeName.toLowerCase().replace(/\s+/g, '-')}-aadhar.jpeg`;
    const filepath = path.join(aadharDir, filename);

    // Write the file
    await writeFile(filepath, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
