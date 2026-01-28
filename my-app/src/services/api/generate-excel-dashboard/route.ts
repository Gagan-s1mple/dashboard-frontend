// app/api/generate-excel-dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const dataString = formData.get('data') as string;
    const data = JSON.parse(dataString);

    // Create temporary file for data
    const tempDataFile = path.join('/tmp', `data-${Date.now()}.json`);
    await writeFile(tempDataFile, JSON.stringify(data));

    // Run Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_excel_dashboard.py');
    const outputFile = data.outputFile || 'dashboard.xlsx';
    const outputPath = path.join('/tmp', outputFile);

    const command = `python3 ${scriptPath} < ${tempDataFile}`;
    await execAsync(command);

    // Read generated file
    const fileBuffer = await readFile(outputPath);

    // Clean up temp files
    await unlink(tempDataFile);
    await unlink(outputPath);

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputFile}"`,
      },
    });
  } catch (error) {
    console.error('Excel generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel dashboard' },
      { status: 500 }
    );
  }
}