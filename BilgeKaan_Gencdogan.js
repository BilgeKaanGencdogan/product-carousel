(() => {
  const init = async () => {
    buildHTML();
    buildCSS();
    await setEvents(); 
  };

  const buildHTML = () => {
    const html = `
      <div class="carousel-wrapper">
          <button class="arrow left">&#8249;</button>
          <div class="product-carousel"></div>
          <button class="arrow right">&#8250;</button>
    </div>
    `;
    const element = document.querySelector('.banner');
    element.innerHTML = '';
   // const htmlBody = document.querySelector('body');
   // htmlBody.innerHTML = '';
    const productCarouselDiv = document.createElement('div');
    productCarouselDiv.innerHTML = html;
    element.appendChild(productCarouselDiv);
  };

  const buildCSS = () => {
    const css = `
      carousel-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .product-carousel {
      display: flex;
      overflow-x: auto;
      gap: 15px;
      padding: 20px;
      height: 500px;
      scroll-behavior: smooth;
      width: 100%;
    }

    .arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      background-color: rgba(255, 255, 255, 0.8);
      border: none;
      cursor: pointer;
      font-size: 2rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }

    .arrow.left {
      left: 10px;
    }

    .arrow.right {
      right: 10px;
    }
      .product-item {
        flex: 0 0 250px;
        height: 325px;
        border-style: double;
        border-radius: 5px;
        position: relative;
      }
      .product-image {
        border-style: dashed;
      }
      .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .product-info {
        position: relative;
      }
      .product-info p,
      .product-info div {
        margin: 5px;
      }
      .product-item .heart {
        right: 15px;
        top: 10px;
      }
      .heart {
        position: absolute;
        cursor: pointer;
        background-color: #fff;
        border-radius: 50%;
        box-shadow: 0 2px 4px 0 #00000024;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .favorited{
          background-color: red;
      }
    `;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  };

  const setEvents = async () => {
    let items = [];
    const storedProducts = localStorage.getItem('productList');

    if (storedProducts) {
      items = JSON.parse(storedProducts);
    } else {
      items = await fetchAndStoreProducts();
    }

    const favorites = loadFavorites();

    
    let productsToShow = items;
    
    if (favorites && favorites.length > 0) {
      productsToShow = items.filter(item => favorites.includes(Number(item.id)));
    } 

    displayProducts(productsToShow);
    heartEvent(items);

      
    document.querySelector('.arrow.left').addEventListener('click', () => {
      document.querySelector('.product-carousel').scrollBy({
            left: -(document.querySelector('.product-item').offsetWidth + 15),
            behavior: 'smooth'
          });
        });

    document.querySelector('.arrow.right').addEventListener('click', () => {
      document.querySelector('.product-carousel').scrollBy({
        left: (document.querySelector('.product-item').offsetWidth + 15),
        behavior: 'smooth'
      });
    });
  };

  const fetchAndStoreProducts = async () => {
    const response = await fetch(
      'https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json'
    );
    const items = await response.json();
    localStorage.setItem('productList', JSON.stringify(items));
    return items;
  };

  const displayProducts = (items) => {
    const favorites = loadFavorites();
    
    let productHTML = '';

    items.forEach((item, index) => {
        
    const isFavorited = favorites.includes(Number(item.id));
      const favoriteClass = isFavorited ? 'favorited' : '';
        
      const heartIcon = 'https://www.e-bebek.com/assets/svg/default-favorite.svg';
      productHTML += `
        <div class="product-item" data-product-id="${item.id}">
          <div class="heart ${favoriteClass}">
            <img class="heart-icon" src="${heartIcon}" />
          </div>
          <div class="product-image">
            <img src="${item.img}" alt="${item.name}" />
          </div>
          <div class="product-info">
            <p class="product-brand-name">${item.brand} - ${item.name}</p>
            <div class="product-pricing">
              ${item.original_price !== item.price
                ? `<span class="original-price">${item.original_price} TL</span>` 
                : ''
              }
              <span class="current-price">${item.price} TL</span>
            </div>
          </div>
        </div>
      `;
    });

    const carousel = document.querySelector('.product-carousel');
    carousel.innerHTML = productHTML;
  };

  const heartEvent = (allProducts) => {
    const carousel = document.querySelector('.product-carousel');
    
    
    carousel.addEventListener('click', (e) => {
        
      // Not: burada bunu yapmamaın sebebi koyduğum resime tıklamama rağmen bir türlü fonksiyon çalışmıyordu, ben de tamamen product div'ine click fonsktionu atadım ama o kalbin olduğu yere tıklanırsa eğer favori atma işlemi devreye girsin dedim.
        
      const isHeartIcon = e.target.classList.contains('heart-icon');
      const isHeartContainer = e.target.classList.contains('heart');
      const isInsideHeart = e.target.closest('.heart');
      
      
      if (isHeartIcon || isHeartContainer || isInsideHeart) {
        handleHeartClick(e, allProducts);
      }
      else if (e.target.closest('.product-item') && !isHeartIcon && !isHeartContainer && !isInsideHeart) {
        const productItem = e.target.closest('.product-item');
        const productId = Number(productItem.dataset.productId);
        const product = allProducts.find(p => p.id === productId);

       
        if (product && product.url) {
          window.location.href = product.url;
        }
      }
    });
  };

  const handleHeartClick = (e, allProducts) => {


    const productItem = e.target.closest('.product-item');

    const productId = Number(productItem.dataset.productId); 
   
    
    let favorites = loadFavorites();


    if (favorites.includes(productId)) {
      favorites = favorites.filter(id => id !== productId);
    } else {
      favorites.push(productId);
      
    }

    saveFavorites(favorites); 
   
    displayProducts(allProducts);
  };

  const loadFavorites = () => {
    const stored = localStorage.getItem('favoriteProducts');
    const favorites = stored ? JSON.parse(stored) : [];
    return favorites;
  };

  const saveFavorites = (favoriteIds) => {
    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteIds));
  };

    init();
  
})();