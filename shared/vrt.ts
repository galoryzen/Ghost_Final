// shared/vrt.ts

import * as fs from 'fs';
import * as path from 'path';
//import * as resemble from 'resemblejs';
import * as nunjucks from 'nunjucks';
import { get } from 'http';
const resemble = require('resemblejs');

interface StepResult {
    stepName: string;
    imagePath1: string;
    imagePath2: string;
    diffImagePath: string;
    isDifferent: boolean;
    misMatchPercentage: number;
}

interface TestResult {
    testName: string;
    steps: StepResult[];
    isFailed: boolean;
}

async function compareImages(imageBuffer1: Buffer, imageBuffer2: Buffer): Promise<any> {
    return new Promise((resolve, reject) => {
        resemble(imageBuffer1)
            .compareTo(imageBuffer2)
            .onComplete((data: any) => {
                resolve(data);
            });
    });
}

function generateReport(testResults: TestResult[], outputPath: string, version1: string, version2: string) {
    // Configure Nunjucks
    nunjucks.configure({ autoescape: true });

    const reportTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Visual Regression Test Report</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
            h1 { text-align: center; }
            .test, .step { margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px; }
            .test-header, .step-header { background: #f9f9f9; padding: 10px; cursor: pointer; }
            .test-header:hover, .step-header:hover { background: #ececec; }
            .test-content, .step-content { display: none; padding: 10px; }
            .images { display: flex; gap: 10px; }
            .images img { max-width: 300px; border: 1px solid #ccc; }
            .failed { color: red; font-weight: bold; }
            .passed { color: green; font-weight: bold; }
            .accordion-toggle { font-weight: bold; }
        </style>
        <script>
            function toggleAccordion(element) {
                const content = element.nextElementSibling;
                content.style.display = content.style.display === "none" || !content.style.display ? "block" : "none";
            }
        </script>
    </head>
    <body>
        <h1>Visual Regression Test Report</h1>
        <p>Comparison between Version {{ version1 }} and Version {{ version2 }}</p>
        {% for test in tests %}
            <div class="test">
                <div class="test-header" onclick="toggleAccordion(this)">
                    <span class="accordion-toggle">{{ test.testName }}</span> - 
                    {% if test.isFailed %}
                        <span class="failed">Failed</span>
                    {% else %}
                        <span class="passed">Passed</span>
                    {% endif %}
                </div>
                <div class="test-content">
                    {% for step in test.steps %}
                        <div class="step">
                            <div class="step-header" onclick="toggleAccordion(this)">
                                {{ step.stepName }} - Difference: {{ step.misMatchPercentage }}% - 
                                {% if step.isDifferent %}
                                    <span class="failed">Failed</span>
                                {% else %}
                                    <span class="passed">Passed</span>
                                {% endif %}
                            </div>
                            <div class="step-content">
                                <div class="images">
                                    <div>
                                        <p>Version {{ version1 }}</p>
                                        <img src="{{ step.imagePath1 }}" alt="Version {{ version1 }}">
                                    </div>
                                    <div>
                                        <p>Version {{ version2 }}</p>
                                        <img src="{{ step.imagePath2 }}" alt="Version {{ version2 }}">
                                    </div>
                                    <div>
                                        <p>Difference</p>
                                        <img src="{{ step.diffImagePath }}" alt="Difference">
                                    </div>
                                </div>
                            </div>
                        </div>
                    {% endfor %}
                </div>
            </div>
        {% endfor %}
    </body>
    </html>
    `;

    const renderedHtml = nunjucks.renderString(reportTemplate, { tests: testResults, version1, version2 });

    const reportPath = path.join(outputPath, 'index.html');

    fs.writeFileSync(reportPath, renderedHtml);

    console.log(`Report generated at ${reportPath}`);
}

function getAnalogPath(fileName:string, pathSecondVersion:string):string {
    const images = fs.readdirSync(pathSecondVersion).filter(file => file.endsWith('.png'));
    const fixedName = fileName.substring(4);
    for (let image of images) {
        if (image.includes(fixedName)) {
            return path.join(pathSecondVersion, image);
        }
    }
    return "";
}

async function main() {
    const projectRoot = path.resolve(__dirname, '..');
    const screenshotsPath = path.join(projectRoot, 'screenshots', 'playwright');
    const version1 = '4.5';
    const version2 = '5.96.0';
    const outputPath = path.join(projectRoot, 'vrt-report');
    const diffImagesPath = path.join(outputPath, 'diff-images');

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    if (!fs.existsSync(diffImagesPath)) {
        fs.mkdirSync(diffImagesPath);
    }

    const version1TestsPath = path.join(screenshotsPath, version1);
    const version2TestsPath = path.join(screenshotsPath, version2);

    const testResults: TestResult[] = [];

    const testFolders = fs.readdirSync(version1TestsPath);

    for (const testFolder of testFolders) {
        const testFolderPath1 = path.join(version1TestsPath, testFolder);
        const testFolderPath2 = path.join(version2TestsPath, testFolder);

        if (!fs.existsSync(testFolderPath2)) {
            console.warn(`Test folder ${testFolder} does not exist in version ${version2}`);
            continue;
        }

        const images1 = fs.readdirSync(testFolderPath1).filter(file => file.endsWith('.png'));

        const steps: StepResult[] = [];
        let testFailed = false;

        for (const imageName of images1) {
            const imagePath1 = path.join(testFolderPath1, imageName);
            const imagePath2 = getAnalogPath(imageName, testFolderPath2);

            if (!fs.existsSync(imagePath2)) {
                console.warn(`Image ${imageName} in test ${testFolder} does not exist in version ${version2}`);
                continue;
            }

            const imageBuffer1 = fs.readFileSync(imagePath1);
            const imageBuffer2 = fs.readFileSync(imagePath2);

            const comparison = await compareImages(imageBuffer1, imageBuffer2);

            const misMatchPercentage = parseFloat(comparison.misMatchPercentage);

            const isDifferent = misMatchPercentage > 3;

            if (isDifferent) {
                testFailed = true;
            }

            // Save the diff image
            const diffImageName = `${testFolder}_${imageName}`;
            const diffImagePath = path.join(diffImagesPath, diffImageName);

            fs.writeFileSync(diffImagePath, comparison.getBuffer());

            steps.push({
                stepName: imageName,
                imagePath1: path.relative(outputPath, imagePath1),
                imagePath2: path.relative(outputPath, imagePath2),
                diffImagePath: path.relative(outputPath, diffImagePath),
                isDifferent,
                misMatchPercentage,
            });
        }

        testResults.push({
            testName: testFolder,
            steps,
            isFailed: testFailed,
        });
    }

    // Now generate the HTML report
    generateReport(testResults, outputPath, version1, version2);
}

main();
