const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

const images = {
    logos: {
        'kikslogo.png': 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop'
    },
    destinations: {
        'paris.jpg': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
        'kenya.jpg': 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&h=400&fit=crop',
        'dubai.jpg': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
        'maldives.jpg': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop'
    },
    hero: {
        'hero1.jpg': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=600&fit=crop',
        'hero2.jpg': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=600&fit=crop',
        'hero3.jpg': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&h=600&fit=crop'
    },
    gallery: {
        'mecque2023.jpg': 'https://images.unsplash.com/photo-1604947388762-9f3e2b6e855e?w=600&h=400&fit=crop',
        'europe2023.jpg': 'https://images.unsplash.com/photo-1493707553966-283afac8c358?w=600&h=400&fit=crop',
        'kenya2023.jpg': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop',
        'dubai2023.jpg': 'https://images.unsplash.com/photo-1583997052103-b4a1cb810f7b?w=600&h=400&fit=crop'
    }
};

async function downloadAllImages() {
    const baseDir = path.join(__dirname, '..', 'public', 'assets', 'images');
    
    for (const [folder, imageList] of Object.entries(images)) {
        const folderPath = path.join(baseDir, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        for (const [filename, url] of Object.entries(imageList)) {
            const filepath = path.join(folderPath, filename);
            console.log(`Downloading ${filename}...`);
            try {
                await downloadImage(url, filepath);
                console.log(`Downloaded ${filename}`);
            } catch (error) {
                console.error(`Error downloading ${filename}:`, error);
            }
        }
    }
}

downloadAllImages().then(() => {
    console.log('All images downloaded successfully!');
}).catch(error => {
    console.error('Error downloading images:', error);
});
