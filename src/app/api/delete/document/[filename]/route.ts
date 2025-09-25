import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params;
    const documentId = filename.split('-').pop()?.split('.')[0]; // Extract documentId from filename

    let deleteDir = '';
    if (documentId === 'profile') { // Assuming filename will be `employeename-profile.jpeg`
      deleteDir = path.join(process.cwd(), 'public', 'images', 'profile-pictures');
    } else if (documentId === 'aadhar') { // Assuming filename will be `employeename-aadhar.jpeg`
      deleteDir = path.join(process.cwd(), 'public', 'images', 'aadhar');
    } else {
      deleteDir = path.join(process.cwd(), 'public', 'images', 'documents'); // Generic documents
    }

    const filePath = path.join(deleteDir, filename);

    await fs.unlink(filePath);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ message: 'Failed to delete document' }, { status: 500 });
  }
}
