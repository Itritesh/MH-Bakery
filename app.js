document.addEventListener('DOMContentLoaded', () => {
    // === 1. State Management ===
    let cart = JSON.parse(localStorage.getItem('maharashtra_bakery_cart')) || [];
    let currentGalleryIndex = 0;

    // === 2. UI Elements ===
    const header = document.querySelector('header');
    const cartCountElements = document.querySelectorAll('a[aria-label^="Cart"] span');
    const revealElements = document.querySelectorAll('.reveal-hidden');

    // === 3. Helper Functions ===
    const updateCartCountUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
        const cartLinks = document.querySelectorAll('a[aria-label^="Cart"]');
        cartLinks.forEach(link => {
            link.setAttribute('aria-label', `Cart with ${totalItems} items`);
        });
        localStorage.setItem('maharashtra_bakery_cart', JSON.stringify(cart));
    };

    const addToCart = (product) => {
        const quantity = Number(product.quantity) || 1;
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        updateCartCountUI();
    };

    const buyNow = (product) => {
        // Redirect to product detail page with product ID
        window.location.href = `product-detail.html?product=${product.id}`;
    };

    const updateCartItem = (productId, newQuantity) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                cart = cart.filter(item => item.id !== productId);
            } else {
                item.quantity = newQuantity;
            }
            updateCartCountUI();
            renderCheckoutCart();
        }
    };

    const getCartTotal = () => {
        const subtotal = cart.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        const gst = Math.round(subtotal * 0.05);
        const total = subtotal + gst;
        return { subtotal, gst, total };
    };

    const renderCheckoutCart = () => {
        if (!window.location.pathname.includes('checkout.html')) return;

        const cartContainer = document.querySelector('[data-cart-items]');
        const orderSummaryContainer = document.querySelector('[data-order-summary-items]');

        if (!cartContainer || !orderSummaryContainer) return;

        // Clear existing items
        const existingItems = cartContainer.querySelectorAll('.flex.gap-4.bg-white.rounded-3xl');
        existingItems.forEach(item => item.remove());

        const existingSummaryItems = orderSummaryContainer.querySelectorAll('.flex.gap-3.items-center');
        existingSummaryItems.forEach(item => item.remove());

        if (cart.length === 0) {
            cartContainer.insertAdjacentHTML('afterbegin', `
                <div class="rounded-3xl p-6 border border-brand-border bg-brand-surface text-brand-muted">
                    Your cart is empty. Add items from Collections or the homepage.
                </div>
            `);
            updateOrderSummary();
            return;
        }

        // Render cart items
        cart.forEach(item => {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const itemTotal = price * quantity;

            // Main cart item
            const cartItemHTML = `
                <div class="flex gap-4 bg-white rounded-3xl p-4 border border-brand-border shadow-card" data-product-id="${item.id}" data-unit-price="${price}">
                    <div class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-surface border border-brand-border-light">
                        <img alt="${item.name}" loading="lazy" width="80" height="80" class="w-full h-full object-cover bg-gray-200" style="color: transparent" src="${item.image}" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-brand-foreground leading-snug">${item.name}</p>
                        <p class="text-xs text-brand-subtle mt-0.5">${item.weight}</p>
                        <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-0 border border-brand-border rounded-xl overflow-hidden">
                                    <button class="qty-btn w-9 h-9 flex items-center justify-center text-brand-muted" aria-label="Decrease" data-product-id="${item.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" width="14" height="14">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path>
                                        </svg>
                                    </button>
                                    <span class="w-9 h-9 flex items-center justify-center text-sm font-bold text-brand-foreground border-x border-brand-border">${quantity}</span>
                                    <button class="qty-btn w-9 h-9 flex items-center justify-center text-brand-muted" aria-label="Increase" data-product-id="${item.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" width="14" height="14">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                                        </svg>
                                    </button>
                                </div>
                                <button type="button" class="text-xs font-semibold text-red-600 hover:text-red-800 transition remove-btn inline-flex items-center gap-1" data-remove-product-id="${item.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" class="text-red-600">
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5V6" />
                                        <path d="M19 6 18.2 19.2A2 2 0 0 1 16.2 21H7.8a2 2 0 0 1-1.8-1.8L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                    Remove
                                </button>
                            </div>
                            <p class="text-base font-bold text-brand-foreground">₹${itemTotal.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;

            // Order summary item
            const summaryItemHTML = `
                <div class="flex gap-3 items-center">
                    <div class="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-surface border border-brand-border-light">
                        <img alt="${item.name}" loading="lazy" width="56" height="56" class="w-full h-full object-cover bg-gray-200" style="color: transparent" src="${item.image}" />
                        <span class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">${quantity}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-brand-foreground truncate">${item.name}</p>
                        <p class="text-xs text-brand-subtle">${item.weight}</p>
                    </div>
                    <p class="text-sm font-bold text-brand-foreground flex-shrink-0">₹${itemTotal.toLocaleString()}</p>
                </div>
            `;

            cartContainer.insertAdjacentHTML('afterbegin', cartItemHTML);
            orderSummaryContainer.insertAdjacentHTML('afterbegin', summaryItemHTML);
        });

        updateOrderSummary();
    };

    const updateOrderSummary = () => {
        const { subtotal, gst, total } = getCartTotal();

        // Update main cart summary
        const summaryElements = document.querySelectorAll('.bg-white.rounded-3xl.p-5.border.border-brand-border.shadow-card.space-y-3');
        summaryElements.forEach(summary => {
            const spans = summary.querySelectorAll('span');
            spans.forEach(span => {
                if (span.textContent.includes('Subtotal')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${subtotal.toLocaleString()}`;
                }
                if (span.textContent.includes('GST (5%)')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${gst.toLocaleString()}`;
                }
                if (span.textContent.includes('Total')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${total.toLocaleString()}`;
                }
            });
        });

        // Update order summary sidebar
        const sidebarSummary = document.querySelector('.space-y-2\\.5');
        if (sidebarSummary) {
            const spans = sidebarSummary.querySelectorAll('span');
            spans.forEach(span => {
                if (span.textContent.includes('Subtotal')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${subtotal.toLocaleString()}`;
                }
                if (span.textContent.includes('GST (5%)')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${gst.toLocaleString()}`;
                }
                if (span.textContent.includes('Total')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${total.toLocaleString()}`;
                }
            });
        }
    };

    // === 4. Feature Initializations ===

    // Header scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu
    const menuBtn = document.querySelector('button[aria-label="Open menu"]');
    const closeBtn = document.querySelector('button[aria-label="Close menu"]');
    const mobileMenu = document.querySelector('.mobile-menu');
    const backdrop = document.querySelector('.backdrop');

    const toggleMenu = (open) => {
        if (mobileMenu && backdrop) {
            mobileMenu.classList.toggle('hidden', !open);
            backdrop.classList.toggle('hidden', !open);
            menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.style.overflow = open ? 'hidden' : '';
        }
    };

    if (menuBtn) menuBtn.addEventListener('click', () => toggleMenu(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
    if (backdrop) backdrop.addEventListener('click', () => toggleMenu(false));

    // Product Gallery
    const thumbs = document.querySelectorAll('.thumb-item');
    if (thumbs.length > 0) {
        const mainImg = document.querySelector('.product-img-wrap img');
        const prevBtn = document.querySelector('button[aria-label="Previous image"]');
        const nextBtn = document.querySelector('button[aria-label="Next image"]');

        const updateGallery = (index) => {
            currentGalleryIndex = index;
            const newSrc = thumbs[index].querySelector('img').src;
            if (mainImg) mainImg.src = newSrc;
            
            thumbs.forEach(t => t.classList.remove('active'));
            thumbs[index].classList.add('active');

            const dots = document.querySelectorAll('button[aria-label^="View image"]');
            dots.forEach((dot, i) => {
                dot.style.width = (i === index) ? '24px' : '6px';
                dot.style.backgroundColor = (i === index) ? '#fff' : 'rgba(255,255,255,0.5)';
            });
        };

        thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => updateGallery(index)));
        if (prevBtn) prevBtn.addEventListener('click', () => updateGallery((currentGalleryIndex - 1 + thumbs.length) % thumbs.length));
        if (nextBtn) nextBtn.addEventListener('click', () => updateGallery((currentGalleryIndex + 1) % thumbs.length));
    }

    // Quantity Adjusters + Remove buttons
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove-product-id]');
        if (removeBtn) {
            const productId = removeBtn.getAttribute('data-remove-product-id');
            const itemRow = removeBtn.closest('[data-product-id]');
            if (itemRow) {
                itemRow.classList.add('removing-cart-item');
            }
            if (productId) {
                setTimeout(() => updateCartItem(productId, 0), 220);
            }
            return;
        }

        const btn = e.target.closest('button');
        if (!btn) return;

        const productId = btn.getAttribute('data-product-id');
        const isDecrease = btn.getAttribute('aria-label')?.startsWith('Decrease');
        const isIncrease = btn.getAttribute('aria-label')?.startsWith('Increase');

        if (isDecrease) {
            const span = btn.nextElementSibling;
            if (span) {
                const currentQty = parseInt(span.textContent, 10);
                if (currentQty > 1) {
                    span.textContent = currentQty - 1;
                    if (productId) updateCartItem(productId, currentQty - 1);
                }
            }
        } else if (isIncrease) {
            const span = btn.previousElementSibling;
            if (span) {
                const currentQty = parseInt(span.textContent, 10);
                span.textContent = currentQty + 1;
                if (productId) updateCartItem(productId, currentQty + 1);
            }
        }
    });

    // Add to Cart and Buy Now
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a');
        if (!btn) return;

        const text = btn.textContent.trim().toLowerCase();
        const isAddBtn = text === 'add' || text.includes('add to cart') || btn.getAttribute('aria-label')?.includes('Add');
        const isBuyNowBtn = text.includes('buy now');

        if (isAddBtn || isBuyNowBtn) {
            e.preventDefault();

            // Get product details from the card
            const card = btn.closest('.collection-card') || btn.closest('[data-product]');
            if (!card) return;

            const productData = card.getAttribute('data-product');
            let product;

            if (productData) {
                product = JSON.parse(productData);
            } else {
                // Extract product info from DOM
                const img = card.querySelector('img');
                const nameEl = card.querySelector('h2, h3, h1');
                const priceEl = card.querySelector('p.font-bold, .text-3xl.font-bold');
                const weightEl = card.querySelector('p.text-xs, p.text-sm');

                if (!nameEl || !priceEl) return;

                const name = nameEl.textContent.trim();
                const price = parseInt(priceEl.textContent.replace(/[^\d]/g, ''));
                const image = img ? img.src : '';
                const weight = weightEl ? weightEl.textContent.trim() : '250g';

                // Generate unique ID based on name
                const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                product = {
                    id,
                    name,
                    price,
                    quantity: 1, // Will be updated below
                    image,
                    weight
                };
            }

            // Always update quantity based on the UI
            let qtyToAdd = 1;
            if (text.includes('add to cart')) {
                const qtySpan = document.querySelector('.w-12.h-11.flex.items-center.justify-center');
                if (qtySpan) qtyToAdd = parseInt(qtySpan.textContent, 10) || 1;
            }
            product.quantity = qtyToAdd;

            if (isBuyNowBtn) {
                // For Buy Now on collections page, redirect to detail.
                // For Buy Now on detail page (which says Instant Checkout), add to cart and go to checkout.
                if (text.includes('checkout')) {
                    addToCart(product);
                    window.location.href = 'checkout.html';
                } else {
                    buyNow(product);
                }
            } else {
                addToCart(product);

                // Visual feedback
                const originalHTML = btn.innerHTML;
                btn.innerHTML = 'Added!';
                btn.classList.add('bg-success');
                setTimeout(() => {
                    window.location.href = 'collections.html';
                }, 500);
            }
        }
    });

    // Pack Size Selector
    const packBtns = document.querySelectorAll('button.relative.px-5.py-3.rounded-2xl');
    packBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            packBtns.forEach(b => {
                b.classList.remove('border-primary', 'bg-primary/5', 'text-primary');
                b.classList.add('border-brand-border', 'text-brand-muted');
            });
            btn.classList.add('border-primary', 'bg-primary/5', 'text-primary');
            btn.classList.remove('border-brand-border', 'text-brand-muted');
        });
    });

    // Reveal on Scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Proceed button behavior
    const proceedToDeliveryBtn = document.querySelector('#proceedToDeliveryButton');
    const orderConfirmationScreen = document.querySelector('#orderConfirmationScreen');
    const checkoutMain = document.querySelector('main');
    const orderIdText = document.querySelector('#orderIdText');
    const continueShoppingBtn = document.querySelector('#continueShoppingBtn');

    if (proceedToDeliveryBtn) {
        proceedToDeliveryBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (!cart.length) {
                alert('Your cart is empty. Add items before proceeding to delivery.');
                return;
            }

            const generatedOrderId = `CM${Date.now().toString().slice(-6)}`;
            if (orderIdText) {
                orderIdText.textContent = generatedOrderId;
            }

            cart = [];
            updateCartCountUI();
            localStorage.setItem('maharashtra_bakery_cart', JSON.stringify(cart));

            if (checkoutMain) checkoutMain.classList.add('hidden');
            if (orderConfirmationScreen) orderConfirmationScreen.classList.remove('hidden');
        });
    }

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Product Detail Page Dynamic Loading
    if (window.location.pathname.includes('product-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');

        if (productId) {
            // Product data mapping
            const products = {
                'almond-fingers': {
                    name: 'Almond Fingers',
                    price: 395,
                    weight: '250g',
                    image: 'assets/images/DSC02867.jpg',
                    gallery: ['assets/images/DSC02867.jpg', 'assets/images/DSC02868.jpg', 'assets/images/DSC02869.jpg'],
                    description: 'Buttery, crumbly shortbread loaded with roasted almond flakes from Maharashtra Bakery in Maharashtra, India. India\'s bestselling cookie.',
                    category: 'Classic Cookies'
                },
                'choco-chip-delight': {
                    name: 'Choco Chip Delight',
                    price: 349,
                    weight: '250g',
                    image: 'assets/images/DSC02868.jpg',
                    gallery: ['assets/images/DSC02868.jpg', 'assets/images/DSC02867.jpg', 'assets/images/DSC02870.jpg'],
                    description: 'Rich chocolate chip cookies with premium Belgian chocolate chunks and a perfect chewy texture.',
                    category: 'Gourmet Cookies'
                },
                'assorted-gift-tin': {
                    name: 'Assorted Gift Tin',
                    price: 895,
                    weight: '500g',
                    image: 'assets/images/DSC02869.jpg',
                    gallery: ['assets/images/DSC02869.jpg', 'assets/images/DSC02867.jpg', 'assets/images/DSC02868.jpg'],
                    description: 'A perfect assortment of our finest cookies in an elegant gift tin, ideal for special occasions.',
                    category: 'Gift Tins'
                },
                'double-chocolate-melt': {
                    name: 'Double Chocolate Melt',
                    price: 425,
                    weight: '250g',
                    image: 'assets/images/DSC02870.jpg',
                    gallery: ['assets/images/DSC02870.jpg', 'assets/images/DSC02868.jpg', 'assets/images/DSC02869.jpg'],
                    description: 'Decadent double chocolate cookies that literally melt in your mouth with rich cocoa flavor.',
                    category: 'Indulgence'
                },
                'millet-jaggery-cookies': {
                    name: 'Millet Jaggery Cookies',
                    price: 295,
                    weight: '250g',
                    image: 'assets/images/DSC02871.jpg',
                    gallery: ['assets/images/DSC02871.jpg', 'assets/images/DSC02870.jpg', 'assets/images/DSC02872.jpg'],
                    description: 'Healthy and nutritious cookies made with millet flour and natural jaggery sweetener.',
                    category: 'Health First'
                },
                'oatmeal-raisin': {
                    name: 'Oatmeal & Raisin',
                    price: 350,
                    weight: '250g',
                    image: 'assets/images/DSC02872.jpg',
                    gallery: ['assets/images/DSC02872.jpg', 'assets/images/DSC02871.jpg', 'assets/images/DSC02867.jpg'],
                    description: 'Classic oatmeal cookies with plump raisins and a wholesome texture, naturally sugar-free.',
                    category: 'Sugar Free'
                }
            };

            const product = products[productId];
            if (product) {
                // Update page title
                document.title = `${product.name} ${product.weight} — Maharashtra Bakery`;

                // Update main product title
                const titleElement = document.querySelector('h1 span');
                if (titleElement) titleElement.textContent = `${product.name} ${product.weight}`;

                // Update price
                const priceElement = document.querySelector('.text-4xl.font-bold');
                if (priceElement) priceElement.textContent = `₹${product.price}`;

                // Update category
                const categoryElement = document.querySelector('.text-\\[10px\\].font-bold.uppercase.tracking-widest');
                if (categoryElement) categoryElement.textContent = product.category.toUpperCase();

                // Update main image
                const mainImage = document.querySelector('.product-img-wrap img');
                if (mainImage) mainImage.src = product.image;

                // Update gallery thumbnails
                const thumbs = document.querySelectorAll('.thumb-item img');
                thumbs.forEach((thumb, index) => {
                    if (product.gallery[index]) {
                        thumb.src = product.gallery[index];
                    }
                });

                // Update meta description
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.content = product.description;

                // Update product data attribute for cart functionality
                const productContainer = document.querySelector('[data-product]');
                if (productContainer) {
                    const productData = {
                        id: productId,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image,
                        weight: product.weight
                    };
                    productContainer.setAttribute('data-product', JSON.stringify(productData));
                }
            }
        }
    }

    // Initial UI Sync
    updateCartCountUI();
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckoutCart();
    }
});
