import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

router.get('/products', async (req, res) => {
    const products = await ProductService.getAllProducts(req.query);

    res.render(
        'index',
        {
            title: 'Productos',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs)),
            prevLink: {
                exist: products.prevLink ? true : false,
                link: products.prevLink
            },
            nextLink: {
                exist: products.nextLink ? true : false,
                link: products.nextLink
            }
        }
    )
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await ProductService.getAllProducts(req.query);
    res.render(
        'realTimeProducts',
        {
            title: 'Productos',
            style: 'index.css',
            products: JSON.parse(JSON.stringify(products.docs))
        }
    )
});

router.get('/cart/:cid', async (req, res) => {
    try {
        const cart = await CartService.getProductsFromCartByID(req.params.cid);

        res.render(
            'cart',
            {
                title: 'Carrito',
                style: 'index.css',
                products: JSON.parse(JSON.stringify(cart.products))
            }
        )
    } catch (error) {
        return res.render(
            'notFound',
            {
                title: 'Not Found',
                style: 'index.css'
            }
        );
    }
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Registro', style: 'index.css' });
});

export default router;