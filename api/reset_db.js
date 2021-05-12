const { Pool } = require('pg');
const conf = {
    user: 'postgres',
    host: 'localhost',
    database: 'CS353Project',
    password: 'cs353dbpw',
    port: 5432,
}

let pool = new Pool(conf);

async function dropTables() {
    const tables = [
        'Contain', 'HasOption', 'Specify', 'ConsistOf', 'HasReview', 'CompleteOrder', 'SeeReview', 'HasAddress', 'IssueWarning', 'AssignedToTicket', 'SubmitTicket', 'HasTicket', 'Favorite', 'Contact', 'RestaurantContact', 'Owns', 'CreateReview', 'RequestForDelivery', 'DeliveredBy', 'DeliveredTo', 'SupportStaff', 'SupportTicket', 'DeliveryPerson', 'Review', 'Orderable', 'Option_', 'Item', 'Orders', 'Customer', 'RestaurantOwner', 'Restaurant', 'Address', 'Phone', 'Users'
       ]
    const client = await pool.connect();
    for (const tableName of tables) {
      try {
        const res = await client.query('DROP TABLE IF EXISTS ' + tableName);
      } catch (err) {
        console.log(err.stack);
      }
   }
   client.end();
}

async function createTables() {
    const client = await pool.connect();
    try {
        await client.query(`CREATE TABLE Item ( item_id SERIAL PRIMARY KEY, name VARCHAR, 
            content VARCHAR, size VARCHAR, itemtype VARCHAR);`);

        await client.query(`CREATE TABLE Option_ ( name VARCHAR, PRIMARY KEY ( name ));`);

        await client.query(`CREATE TABLE Orders ( order_id SERIAL PRIMARY KEY, 
                    status VARCHAR, order_time TIMESTAMP, 
                    delivery_time TIMESTAMP, has_plastic BOOLEAN, note VARCHAR);`);

        await client.query(`CREATE TABLE Review ( review_id SERIAL PRIMARY KEY, delivery_rating FLOAT, restaurant_rating FLOAT, 
                    restaurant_comment VARCHAR, delivery_comment VARCHAR, restaurant_response VARCHAR, 
                    order_id INTEGER UNIQUE, 
                    FOREIGN KEY (order_id) REFERENCES Orders(order_id));`);

        await client.query(`CREATE TABLE Address ( address_id SERIAL PRIMARY KEY, explanation VARCHAR, street VARCHAR, 
                    street_number INTEGER, street_name INTEGER, apt_number INTEGER, city VARCHAR, 
                    county VARCHAR, zip VARCHAR);`);

        await client.query(`CREATE TABLE Restaurant ( restaurant_id SERIAL PRIMARY KEY, name VARCHAR, money FLOAT, 
                    average_rating FLOAT, is_open BOOLEAN, address_id INTEGER UNIQUE,
                    FOREIGN KEY(address_id) references Address(address_id));`);

        await client.query(`CREATE TABLE Orderable ( restaurant_id INTEGER, orderable_name VARCHAR, discount FLOAT, 
                    price FLOAT, instock BOOLEAN, 
                    PRIMARY KEY ( restaurant_id, orderable_name), 
                    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id));`);

        await client.query(`CREATE TABLE Users ( username VARCHAR, first_name VARCHAR, 
                    last_name VARCHAR, birthdate DATE, email VARCHAR, 
                    password VARCHAR, PRIMARY KEY ( username ));`);

        await client.query(`CREATE TABLE DeliveryPerson (username VARCHAR , average_rating FLOAT, is_busy BOOLEAN,
                            PRIMARY KEY(username),
                            FOREIGN KEY (username) references Users(username));`);

        await client.query(`CREATE TABLE Customer ( username VARCHAR, credit FLOAT, 
                    PRIMARY KEY ( username ), 
                    FOREIGN KEY (username) REFERENCES Users (username));`);

        await client.query(`CREATE TABLE RestaurantOwner ( username VARCHAR, warning_count INTEGER, 
                    PRIMARY KEY ( username ), 
                    FOREIGN KEY (username) REFERENCES Users (username));`);

        await client.query(`CREATE TABLE SupportStaff ( username VARCHAR, rank INTEGER, is_free BOOLEAN, 
                    PRIMARY KEY ( username ), 
                    FOREIGN KEY (username) REFERENCES Users (username));`);

        await client.query(`CREATE TABLE SupportTicket ( ticket_id SERIAL PRIMARY KEY, date DATE, subject VARCHAR, 
                    content VARCHAR, response VARCHAR);`);

        await client.query(`CREATE TABLE Phone ( phone_number VARCHAR, PRIMARY KEY ( phone_number ));`);

        await client.query(`CREATE TABLE Contain ( restaurant_id INTEGER, orderable_name VARCHAR, 
                    item_id INTEGER, quantity INTEGER, 
                    PRIMARY KEY ( restaurant_id, orderable_name, item_id ), 
                    FOREIGN KEY (orderable_name, restaurant_id) references Orderable(orderable_name, restaurant_id), 
                    FOREIGN KEY (item_id) references Item(item_id));`);

        await client.query(`CREATE TABLE HasOption ( restaurant_id INTEGER, option_name VARCHAR, 
                    item_id INTEGER, 
                    PRIMARY KEY ( restaurant_id, option_name, item_id ), 
                    FOREIGN KEY (restaurant_id ) references Restaurant (restaurant_id),
                    FOREIGN KEY (option_name) references Option_(name), 
                    FOREIGN KEY (item_id) references Item(item_id));`);

        await client.query(`CREATE TABLE Specify ( item_id INTEGER, option_name VARCHAR, 
                    order_id INTEGER, restaurant_id INTEGER, orderable_name VARCHAR, item_index INTEGER, exists BOOLEAN, 
                    PRIMARY KEY ( item_id, option_name, order_id, restaurant_id, orderable_name, item_index ), 
                    FOREIGN KEY (item_id) references Item(item_id), 
                    FOREIGN KEY (option_name) references Option_(name),
                    FOREIGN KEY (order_id) references Orders(order_id),
                    FOREIGN KEY (orderable_name, restaurant_id) references Orderable(orderable_name, restaurant_id));`);

        await client.query(`CREATE TABLE ConsistOf (order_id INTEGER, restaurant_id INTEGER, orderable_name VARCHAR, quantity INTEGER,
                        PRIMARY KEY (order_id, restaurant_id, orderable_name),
                        FOREIGN KEY (order_id) references Orders (order_id),
                        FOREIGN KEY (orderable_name, restaurant_id) references Orderable(orderable_name, restaurant_id));`);

        await client.query(`CREATE TABLE HasReview ( restaurant_id INTEGER, review_id INTEGER,
                        PRIMARY KEY(review_id),
                        FOREIGN KEY (restaurant_id) references Restaurant (restaurant_id),
                        FOREIGN KEY (review_id) references Review (review_id));`);

        await client.query(`CREATE TABLE CompleteOrder (order_id INTEGER, username VARCHAR, restaurant_id INTEGER,
                            PRIMARY KEY(order_id),
                            FOREIGN KEY(username) references Customer(username),
                            FOREIGN KEY(restaurant_id) references Restaurant(restaurant_id),
                            FOREIGN KEY(order_id) references Orders(order_id));`);

        await client.query(`CREATE TABLE SeeReview(review_id INTEGER, username VARCHAR,
                        PRIMARY KEY (review_id),
                        FOREIGN KEY (review_id) references Review(review_id),
                        FOREIGN KEY (username) references DeliveryPerson (username));`);

        await client.query(`CREATE TABLE HasAddress(address_id INTEGER, username VARCHAR, name VARCHAR,
                        PRIMARY KEY(address_id),
                        FOREIGN KEY(username) references Customer(username),
                        FOREIGN KEY(address_id) references Address(address_id));`);

        await client.query(`CREATE TABLE IssueWarning (support_staff_username VARCHAR, restaurant_owner_username VARCHAR, issue_time TIMESTAMP,
                            PRIMARY KEY(support_staff_username, restaurant_owner_username, issue_time),
                            FOREIGN KEY(support_staff_username) references SupportStaff(username),
                            FOREIGN KEY(restaurant_owner_username) references RestaurantOwner(username));`);

        await client.query(`CREATE TABLE AssignedToTicket(ticket_id INTEGER, username VARCHAR,
                                PRIMARY KEY(ticket_id),
                                FOREIGN KEY(username) references SupportStaff(username),
                                FOREIGN KEY(ticket_id) references SupportTicket(ticket_id));`);

        await client.query(`CREATE TABLE SubmitTicket(ticket_id INTEGER, username VARCHAR,
                                PRIMARY KEY(ticket_id, username),
                                FOREIGN KEY(username) references Customer(username),
                                FOREIGN KEY(ticket_id) references SupportTicket(ticket_id));`);

        await client.query(`CREATE TABLE HasTicket(ticket_id INTEGER, order_id INTEGER,
                                PRIMARY KEY(ticket_id, order_id),
                                FOREIGN KEY(order_id) references Orders(order_id),
                                FOREIGN KEY(ticket_id) references SupportTicket(ticket_id));`);

        await client.query(`CREATE TABLE Favorite(username VARCHAR, restaurant_id INTEGER,
                                PRIMARY KEY(username, restaurant_id),
                                FOREIGN KEY(username) references Customer(username),
                                FOREIGN KEY(restaurant_id) references Restaurant(restaurant_id));`);

        await client.query(`CREATE TABLE Contact(username VARCHAR, phone_number VARCHAR, name VARCHAR,
                    PRIMARY KEY(username, phone_number),
                    FOREIGN KEY(username) references Customer(username),
                    FOREIGN KEY(phone_number) references Phone(phone_number));`);

        await client.query(`CREATE TABLE RestaurantContact(restaurant_id INTEGER, phone_number VARCHAR,
                    PRIMARY KEY(restaurant_id, phone_number),
                    FOREIGN KEY(restaurant_id) references Restaurant(restaurant_id),
                    FOREIGN KEY(phone_number) references Phone(phone_number));`);

        await client.query(`CREATE TABLE Owns(restaurant_id INTEGER, username VARCHAR,
                    PRIMARY KEY(restaurant_id),
                    FOREIGN KEY(restaurant_id) references Restaurant(restaurant_id),
                    FOREIGN KEY(username) references RestaurantOwner(username));`);

        await client.query(`CREATE TABLE CreateReview(review_id INTEGER, username VARCHAR,
                    PRIMARY KEY(review_id),
                    FOREIGN KEY(review_id) references Review(review_id),
                    FOREIGN KEY(username) references Customer(username));`);

        await client.query(`CREATE TABLE RequestForDelivery(username VARCHAR, order_id INTEGER, acceptance BOOLEAN,
                    PRIMARY KEY(username, order_id),
                    FOREIGN KEY(username) references DeliveryPerson(username),
                    FOREIGN KEY(order_id) references Orders(order_id));`);

        await client.query(`CREATE TABLE DeliveredBy(order_id INTEGER, username VARCHAR,
                    PRIMARY KEY(order_id),
                    FOREIGN KEY(order_id) references Orders(order_id),
                    FOREIGN KEY(username) references DeliveryPerson(username));`);

        await client.query(`CREATE TABLE DeliveredTo(order_id INTEGER, address_id INTEGER,
                    PRIMARY KEY(order_id),
                    FOREIGN KEY(address_id) references Address(address_id),
                    FOREIGN KEY(order_id) references Orders(order_id));`);
    } catch (err) {
        console.log(err.stack);
    }
    client.end();
}

async function addRecords() {
    const client = await pool.connect();
    try {
        await client.query("INSERT INTO Users VALUES ('admin', 'admin', 'admin', '2000-03-18', 'admin@gmail.com', 'admin');");
        await client.query("INSERT INTO Customer VALUES ('admin', 200);");
        await client.query("INSERT INTO Item VALUES (DEFAULT, 'burger', 'patty', 'normal', 'food');");
        await client.query("INSERT INTO Item VALUES (DEFAULT, 'cola', '1 can', '330 ml', 'beverage');");
        await client.query("INSERT INTO Address VALUES ('1', 'bk address', 'jump street', '21', '99', '21', 'ankara', 'cankaya', '06000');");
        await client.query("INSERT INTO Restaurant VALUES ('1', 'bk', '0', '8.5', true, '1');");
        await client.query("INSERT INTO Orderable VALUES ('1', 'burger menu', '0', '20', 'true');");
        await client.query("INSERT INTO Contain VALUES ('1', 'burger menu', '1', '1');");
        await client.query("INSERT INTO Contain VALUES ('1', 'burger menu', '2', '1');");
        await client.query("INSERT INTO Option_ VALUES ('bbq sauce');");
        await client.query("INSERT INTO Hasoption VALUES ('1', 'bbq sauce', '1');");
        await client.query("INSERT INTO Option_ VALUES ('cheese');");
        await client.query("INSERT INTO Hasoption VALUES ('1', 'cheese', '1');");
    } catch (err) {
        console.log(err.stack);
    }
    client.end();
}

dropTables()
    .then(success => createTables())
    .then(success => addRecords())
    .then(success => pool.end());