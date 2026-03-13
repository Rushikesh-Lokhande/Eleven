// Central product catalog for Eleven Robotics SoMs

const products = [
    {
      id: "som-x1",
      name: "Eleven SoM X1",
      price: 8499,
    image: "assets/images/product-images/som-x1.svg",
      description: "Balanced performance ARM-based SoM for general-purpose robotics and embedded AI.",
      category: "Balanced performance",
      power: "Typical 8 W",
    detailPage: "products/som-x1.html"
    },
    {
      id: "som-x2",
      name: "Eleven SoM X2",
      price: 12999,
    image: "assets/images/product-images/som-x2.svg",
      description: "High compute SoM for perception-heavy robots, SLAM, and autonomy stacks.",
      category: "High compute",
      power: "Typical 15 W",
    detailPage: "products/som-x2.html"
    },
    {
      id: "som-lite",
      name: "Eleven SoM Lite",
      price: 5999,
    image: "assets/images/product-images/som-lite.svg",
      description: "Low power SoM for compact robots, gateways, and industrial edge nodes.",
      category: "Low power",
      power: "Typical 4 W",
    detailPage: "products/som-lite.html"
    },
    {
      id: "som-pro",
      name: "Eleven SoM Pro",
      price: 18999,
    image: "assets/images/product-images/som-pro.svg",
      description: "Flagship SoM for advanced robotics, multi-sensor fusion, and heavy AI workloads.",
      category: "Flagship",
      power: "Typical 25 W",
    detailPage: "products/som-pro.html"
    }
  ];
  
  (function (global) {
  // Backward-compatible export used by page renderers
  global.products = products;

    function getProductById(id) {
      return products.find(function (p) {
        return p.id === id;
      }) || null;
    }
  
    // Expose helper if not already namespaced via Cart
    global.ProductCatalog = {
      products: products,
      getProductById: getProductById
    };
  })(window);