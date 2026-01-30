# MCC Code Reference

**Purpose:** Complete mapping of Merchant Category Codes (MCC) to CardStack spending categories

---

## Categories Overview

| Category | Description | Common MCCs |
|----------|-------------|-------------|
| DINING | Restaurants, fast food, bars | 5811-5814 |
| GROCERIES | Supermarkets, food stores | 5411, 5422 |
| WHOLESALE_CLUB | Costco, Sam's, BJ's | 5300 |
| GAS | Gas stations | 5541, 5542 |
| EV_CHARGING | Electric vehicle charging | 5552 |
| TRAVEL_AIR | Airlines | 3000-3350, 4511 |
| TRAVEL_HOTEL | Hotels, lodging | 3501-3999, 7011 |
| TRAVEL_CAR_RENTAL | Car rentals | 3351-3500, 7512 |
| TRANSIT | Public transit, rideshare | 4111, 4121 |
| ENTERTAINMENT | Movies, concerts, sports | 7832, 7941 |
| STREAMING | Netflix, Spotify, etc. | 4899, 5815 |
| PHONE_INTERNET | Phone, internet bills | 4813, 4816 |
| DRUGSTORE | Pharmacies | 5912 |
| HOME_IMPROVEMENT | Home Depot, Lowe's | 5200, 5211 |
| OFFICE_SUPPLY | Staples, Office Depot | 5111 |
| FITNESS | Gyms, health clubs | 7997 |

---

## Dining & Food

| MCC | Description | Examples |
|-----|-------------|----------|
| 5811 | Caterers | |
| 5812 | Restaurants | Sit-down dining |
| 5813 | Bars, taverns, nightclubs | |
| 5814 | Fast food | McDonald's, Chipotle |
| 5441 | Candy, confectionery | |
| 5462 | Bakeries | May code as dining |

---

## Groceries

| MCC | Description | Examples |
|-----|-------------|----------|
| 5411 | Grocery stores | Kroger, Safeway, Publix |
| 5422 | Freezer/meat lockers | Specialty grocers |
| 5451 | Dairy products | |
| 5300 | Wholesale clubs | Costco, Sam's, BJ's |
| 5311 | Department stores | Target, Walmart (often excluded) |

**Note:** Most cards exclude Walmart and Target from grocery bonuses.

---

## Gas & Automotive

| MCC | Description | Examples |
|-----|-------------|----------|
| 5541 | Service stations | Shell, Chevron, BP |
| 5542 | Automated fuel | Pay-at-pump |
| 5172 | Petroleum wholesale | Fleet cards |
| 5552 | EV charging | Tesla, ChargePoint |
| 7523 | Parking | |
| 4784 | Tolls | |

---

## Airlines

| MCC | Airline |
|-----|---------|
| 3000 | United Airlines |
| 3001 | American Airlines |
| 3032 | Alaska Airlines |
| 3058 | Delta Air Lines |
| 3096 | JetBlue |
| 3256 | Southwest Airlines |
| 3260 | Spirit Airlines |
| 4511 | General airlines |

---

## Hotels

| MCC | Hotel Chain |
|-----|-------------|
| 3501 | Marriott |
| 3502 | IHG (Holiday Inn) |
| 3503 | Wyndham |
| 3504 | Hilton |
| 3506 | Choice Hotels |
| 3507 | Best Western |
| 3512 | Hyatt |
| 7011 | General lodging |

---

## Car Rental

| MCC | Company |
|-----|---------|
| 3351 | Hertz |
| 3352 | Avis |
| 3353 | National |
| 3354 | Budget |
| 3357 | Enterprise |
| 7512 | General car rental |

---

## Transit & Rideshare

| MCC | Description | Examples |
|-----|-------------|----------|
| 4111 | Local transit | Subway, buses |
| 4112 | Passenger railways | Commuter rail |
| 4121 | Taxicabs, limos | Uber, Lyft typically |
| 4131 | Bus lines | Greyhound |
| 4411 | Cruise lines | |

---

## Entertainment

| MCC | Description |
|-----|-------------|
| 7832 | Movie theaters |
| 7922 | Theatrical producers |
| 7929 | Concerts, bands |
| 7941 | Sports venues |
| 7991 | Tourist attractions |
| 7996 | Amusement parks |

---

## Streaming & Digital

| MCC | Description | Examples |
|-----|-------------|----------|
| 4899 | Cable, streaming | Netflix, Hulu |
| 5815 | Digital audiovisual | iTunes, Spotify |
| 5816 | Digital games | Xbox, PlayStation |
| 4813 | Telecom services | AT&T, Verizon |

---

## Card Bonus Matrix

| Category | AMEX Gold | CSP | CSR | Venture X | Discover |
|----------|-----------|-----|-----|-----------|----------|
| DINING | 4x | 3x | 3x | 2x | 1%/5%* |
| GROCERIES | 4x | 1x | 1x | 2x | 1%/5%* |
| GAS | 1x | 1x | 1x | 2x | 1%/5%* |
| TRAVEL_AIR | 3x | 5x | 5x | 5x | 1% |
| TRAVEL_HOTEL | 3x | 5x | 10x | 10x | 1% |
| STREAMING | 1x | 1x | 1x | 2x | 1%/5%* |

*5% = Rotating quarterly categories
