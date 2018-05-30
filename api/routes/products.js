const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }


}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('-__v')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        title: doc.title,
                        subtitle: doc.subtitle,
                        newsImage: doc.newsImage,
                        //productImage: doc.productImage,
                        _id: doc._id,
                        request:
                            {
                                type: "GET",
                                url: "http://localhost:3000/products/" + doc._id
                            }
                    }
                })
            };
            // if (docs.lenght >= 0) {
            res.status(200).json(response);
            // } else {
            //     res.status(404).json({
            //         message: 'No entries found'
            //     });
            // }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                message: "erro 1"
            });
        });
});

router.post('/products', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        subtitle: req.body.subtitle,
        newsImage: req.body.newsImage
       
    });
    product.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                title: result.title,
                subtitle: result.subtitle,
                newsImage: result.newsImage,
                _id: result._id,
                request:
                    {
                        type: "GET",
                        url: "http://localhost:3000/products/" + result._id
                    }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            rerror: err,
            message: "erro 2"
        });
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('-__v')
        .exec()
        .then(doc => {
            console.log("From Database: ", doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: "GET",
                        description: "Get all Products",
                        url: "http://localhost:3000/products"
                    }
                });
            } else {
                res.status(404).json({ message: 'No valid entry found for provided ID' })
            }
            res.status(200).json(doc);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
            message: "erro 3"
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then((result) => {
            if (result) {
                res.status(200).json({
                    result,
                    message: "Updated",
                    request:
                        {
                            type: "GET",
                            url: "http://localhost:3000/products/" + id
                        }
                });
            }
            else {
                res.status(404).json({
                    message: "Invalid id"
                })
            }
            console.log(result);
        }).catch((err) => {
            res.status(500).json({ err });
        });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findByIdAndRemove(id)
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Product deleted.",
                request:
                    {
                        type: "POST",
                        url: "http://localhost:3000/products/",
                        body: { title: "String", subtitle: "Number" }

                    }
            });

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                message: "erro 4"
            });
        });
});

module.exports = router;