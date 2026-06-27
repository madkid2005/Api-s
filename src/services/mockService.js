const { faker } = require('@faker-js/faker');

class MockService {
  generateUsers(count = 10) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        },
        company: faker.company.name(),
        jobTitle: faker.person.jobTitle(),
        avatar: faker.image.avatar(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
    }
    return users;
  }

  generateProducts(count = 10) {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];
    const products = [];
    
    for (let i = 0; i < count; i++) {
      const category = faker.helpers.arrayElement(categories);
      products.push({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        category: category,
        brand: faker.company.name(),
        rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
        reviews: faker.number.int({ min: 0, max: 1000 }),
        stock: faker.number.int({ min: 0, max: 500 }),
        images: [
          faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
          faker.image.urlPicsumPhotos({ width: 400, height: 400 })
        ],
        tags: faker.helpers.arrayElements(['new', 'sale', 'popular', 'limited'], 2),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
    }
    return products;
  }

  generateOrders(count = 10, users = null) {
    const orders = [];
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    for (let i = 0; i < count; i++) {
      const items = [];
      const itemCount = faker.number.int({ min: 1, max: 5 });
      let total = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const price = faker.number.float({ min: 5, max: 200, precision: 0.01 });
        const quantity = faker.number.int({ min: 1, max: 3 });
        const itemTotal = price * quantity;
        total += itemTotal;
        
        items.push({
          id: faker.string.uuid(),
          name: faker.commerce.productName(),
          price: price,
          quantity: quantity,
          total: itemTotal
        });
      }
      
      orders.push({
        id: faker.string.uuid(),
        userId: users ? faker.helpers.arrayElement(users).id : faker.string.uuid(),
        items: items,
        total: parseFloat(total.toFixed(2)),
        status: faker.helpers.arrayElement(statuses),
        shippingAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        },
        paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'crypto']),
        trackingNumber: faker.string.alphanumeric(10).toUpperCase(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
    }
    return orders;
  }

  generateCustom(schema, count = 1) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const item = {};
      for (const [key, type] of Object.entries(schema)) {
        item[key] = this.generateValue(type);
      }
      result.push(item);
    }
    return result;
  }

  generateValue(type) {
    const generators = {
      'string': () => faker.string.sample(10),
      'number': () => faker.number.int({ min: 0, max: 1000 }),
      'float': () => faker.number.float({ min: 0, max: 1000, precision: 0.01 }),
      'boolean': () => faker.datatype.boolean(),
      'date': () => faker.date.past(),
      'email': () => faker.internet.email(),
      'phone': () => faker.phone.number(),
      'url': () => faker.internet.url(),
      'uuid': () => faker.string.uuid(),
      'firstName': () => faker.person.firstName(),
      'lastName': () => faker.person.lastName(),
      'fullName': () => faker.person.fullName(),
      'city': () => faker.location.city(),
      'country': () => faker.location.country(),
      'street': () => faker.location.streetAddress()
    };
    
    if (Array.isArray(type)) {
      return faker.helpers.arrayElement(type);
    }
    
    return (generators[type] || generators['string'])();
  }
}

module.exports = new MockService();