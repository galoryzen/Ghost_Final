import { URL, PORT, IMAGE, CNAME, VISUAL_REGRESSION_TESTING, VERSION } from './config';
import { spawn, spawnSync } from 'child_process';

export function alreadyRunning() {
    let output = spawnSync('docker', ['ps', '--filter', `name=${CNAME}`, '--format', '{{.Image}}'], { encoding: 'utf8' });
    return output.stdout.includes(IMAGE);
}

export async function startGhost() {
    if (alreadyRunning() && !VISUAL_REGRESSION_TESTING) {
        return;
    }

    if (VERSION === '4.5') {
        await startGhostWithDockerCompose();
        return;
    }

    let sargs = ['run', '-d', '--rm', '-e', 'NODE_ENV=development', '-e', `url=${URL}`, '-p', `${PORT}:2368`, '--name', CNAME, IMAGE]
    let rargs = ['rm', '-f', CNAME]
    let out;
    spawnSync('docker', rargs);
    out = spawnSync('docker', sargs, { encoding: 'utf8' });

    if (out.status !== 0) {
        throw new Error(`Failed to start docker container: ${out.stderr}`);
    } else {
        console.log(`Started docker container: ${IMAGE} in port ${PORT}`);
    }

    // Return when ghost is ready
    let child = spawn('docker', ['logs', '-f', CNAME]);
    console.log('Waiting for Ghost to be operational');
    if (child.stdout) {
        for await (let line of child.stdout) {
            let l = line.toString('utf8').trim()
            // console.debug(l)
            if (l.includes('Ghost booted')) {
                // Once it's ready return and the test can start
                console.log('Ghost ready for testing');
                // await for 1 second
                await new Promise(resolve => setTimeout(resolve, 1000));
                child.kill();
                return;
            }
        }
    }
}

export async function startGhostWithDockerCompose() {
    spawnSync('docker', ['rm', '-f', CNAME]);

    // delete folder content
    spawnSync('rm', ['-rf', 'content']);

    let out = spawnSync('docker', ['compose', 'up', '-d'], { encoding: 'utf8', stdio: 'pipe' });

    if (out.status !== 0) {
        throw new Error(`Failed to start docker container: ${out.stderr}`);
    } else {
        console.log(`Started docker container: ${IMAGE} on port ${PORT}`);
    }

    // Wait until Ghost is fully booted
    let child = spawn('docker', ['logs', '-f', CNAME], { stdio: 'pipe' });
    console.log('Waiting for Ghost to be operational');
    if (child.stdout) {
        for await (let line of child.stdout) {
            let l = line.toString('utf8').trim();
            // console.log(l);
            if (l.includes('Ghost booted')) {
                console.log('Ghost ready for testing');
                // Add a small delay for safety
                await new Promise(resolve => setTimeout(resolve, 1000));
                child.kill();
                return;
            }
        }
    }
}