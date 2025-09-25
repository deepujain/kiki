import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;
    const employeeName = formData.get('employeeName') as string | null;
    const documentId = formData.get('documentId') as string | null;

    if (!file || !employeeName || !documentId) {
      return NextResponse.json({ message: 'Missing file, employee name, or document ID' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${employeeName.toLowerCase().replace(/\s+/g, '-')}-${documentId}.jpeg`;
    
    let uploadDir = '';
    if (documentId === 'profile-picture') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'profile-pictures');
    } else if (documentId === 'aadhaar-card') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'aadhar');
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'documents'); // Generic documents
    }
    
    const filePath = path.join(uploadDir, filename);

    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ message: 'Document uploaded successfully' });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ message: 'Failed to upload document' }, { status: 500 });
  }
}
