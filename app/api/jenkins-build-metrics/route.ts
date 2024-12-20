{
     [
      {
        "jobName": "00_Shopping_UI_CRT_Agent_Tests",
        "number": 102,
        "fullDisplayName": "00_Shopping_UI_CRT_Agent_Tests #102",
        "result": "FAILURE",
        "totalCount": 100,
        "failCount": 5,
        "skipCount": 2,
        "duration": 300000,
        "failedTests": [
          {
            "id": "test-1",
            "testName": "Should login with valid credentials",
            "filePath": "tests/ui/login.test.js",
            "errorMessage": "Expected user to be logged in, but login button still visible.",
            "screenshotUrl": "https://jenkins-auto.pacific.costcotravel.com/artifacts/102-login-failure.png"
          },
          {
            "id": "test-2",
            "testName": "Should add item to cart",
            "filePath": "tests/ui/cart.test.js",
            "errorMessage": "Item not found in cart after clicking add to cart.",
            "screenshotUrl": "https://jenkins-auto.pacific.costcotravel.com/artifacts/102-cart-failure.png"
          },
          {
            "id": "test-3",
            "testName": "Should apply discount code",
            "filePath": "tests/ui/discount.test.js",
            "errorMessage": "Discount not applied.",
            "screenshotUrl": "https://jenkins-auto.pacific.costcotravel.com/artifacts/102-discount-failure.png"
          },
          {
            "id": "test-4",
            "testName": "Should checkout successfully",
            "filePath": "tests/ui/checkout.test.js",
            "errorMessage": "Checkout button did not redirect to confirmation page.",
            "screenshotUrl": "https://jenkins-auto.pacific.costcotravel.com/artifacts/102-checkout-failure.png"
          },
          {
            "id": "test-5",
            "testName": "Should display product details",
            "filePath": "tests/ui/product-details.test.js",
            "errorMessage": "Product details panel did not expand.",
            "screenshotUrl": null
          }
        ]
      },
      {
        "jobName": "00_Shopping_UI_CRT_Agent_Tests",
        "number": 103,
        "fullDisplayName": "00_Shopping_UI_CRT_Agent_Tests #103",
        "result": "FAILURE",
        "totalCount": 100,
        "failCount": 3,
        "skipCount": 1,
        "duration": 320000,
        "failedTests": [
          {
            "id": "test-6",
            "testName": "Should filter products by category",
            "filePath": "tests/ui/filter.test.js",
            "errorMessage": "Filtered list is empty even though category has products.",
            "screenshotUrl": "https://jenkins-auto.pacific.costcotravel.com/artifacts/103-filter-failure.png"
          },
          {
            "id": "test-7",
            "testName": "Should show promotion banner",
            "filePath": "tests/ui/promotion.test.js",
            "errorMessage": "Promotion banner not visible on homepage.",
            "screenshotUrl": null
          },
          {
            "id": "test-8",
            "testName": "Should remember user session",
            "filePath": "tests/ui/session.test.js",
            "errorMessage": "Session expired earlier than expected.",
            "screenshotUrl": null
          }
        ]
      },
      {
        "jobName": "01_Shopping_UI_CRT_Consumer_Part1",
        "number": 201,
        "fullDisplayName": "01_Shopping_UI_CRT_Consumer_Part1 #201",
        "result": "FAILURE",
        "totalCount": 120,
        "failCount": 4,
        "skipCount": 2,
        "duration": 450000,
        "failedTests": [
          {
            "id": "test-9",
            "testName": "API returns correct product data",
            "filePath": "tests/api/productApi.test.js",
            "errorMessage": "Received 500 instead of 200.",
            "screenshotUrl": null
          },
          {
            "id": "test-10",
            "testName": "User profile updates successfully",
            "filePath": "tests/api/profile.test.js",
            "errorMessage": "PUT /profile returned 404.",
            "screenshotUrl": null
          },
          {
            "id": "test-11",
            "testName": "Should handle network errors gracefully",
            "filePath": "tests/api/network.test.js",
            "errorMessage": "UI did not display error message on network failure.",
            "screenshotUrl": "https://jenkins-auto.pacific.costcotravel.com/artifacts/201-network-failure.png"
          },
          {
            "id": "test-12",
            "testName": "Should display search results",
            "filePath": "tests/ui/search.test.js",
            "errorMessage": "No results displayed for a known query.",
            "screenshotUrl": "https://jenkins-auto.pacific.costcotravel.com/artifacts/201-search-failure.png"
          }
        ]
      }
    ]
  }
  