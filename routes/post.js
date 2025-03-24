const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// uploads 폴더 체크 및 생성
try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어서 생성합니다.');
    fs.mkdirSync('uploads');
}

// 이미지 업로드 설정
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

// 이미지 업로드 라우트
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
});

// 게시글 업로드 라우트
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            UserId: req.user.id,
        });

        // 해시태그 추출
        const hashtags = req.body.content.match(/#\S+/g);
        if (hashtags) {
            await Promise.all(
                hashtags.map(tag =>
                    Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() },
                    })
                )
            );
        }

        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
