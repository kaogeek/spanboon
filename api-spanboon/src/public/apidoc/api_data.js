define({ "api": [
  {
    "type": "post",
    "url": "/api/admin/user/:id/ban",
    "title": "Ban Page API",
    "group": "Admin_API",
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Ban User Success\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/user/:id/ban"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Ban User Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminUserController.ts",
    "groupTitle": "Admin_API",
    "name": "PostApiAdminUserIdBan"
  },
  {
    "type": "post",
    "url": "/api/admin/user/register",
    "title": "Create User",
    "group": "Admin_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>firstName</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>lastName</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "citizenId",
            "description": "<p>citizenId</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "gender",
            "description": "<p>gender</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"firstname\" : \"\",\n     \"lastname\" : \"\",\n     \"email\" : \"\",\n     \"citizenId\" : \"\",\n     \"gender\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create User\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/user/register"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminUserController.ts",
    "groupTitle": "Admin_API",
    "name": "PostApiAdminUserRegister"
  },
  {
    "type": "post",
    "url": "/api/admin/user/search",
    "title": "Search Page API",
    "group": "Admin_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Search User Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/user/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search User error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminUserController.ts",
    "groupTitle": "Admin_API",
    "name": "PostApiAdminUserSearch"
  },
  {
    "type": "delete",
    "url": "/api/admin/config/:name",
    "title": "Delete config API",
    "group": "Admin_Config",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully deleted config.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Config Delete error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminConfigController.ts",
    "groupTitle": "Admin_Config",
    "name": "DeleteApiAdminConfigName"
  },
  {
    "type": "get",
    "url": "/api/admin/config/:name",
    "title": "Get config API",
    "group": "Admin_Config",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully deleted config.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Config Delete error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminConfigController.ts",
    "groupTitle": "Admin_Config",
    "name": "GetApiAdminConfigName"
  },
  {
    "type": "post",
    "url": "/api/admin/config/",
    "title": "Create Config API",
    "group": "Admin_Config",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name *</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>value</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>type as a value class type such as boolean, string, integer *</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"value\" : \"\",\n     \"type\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"New config is created successfully\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/config/"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminConfigController.ts",
    "groupTitle": "Admin_Config",
    "name": "PostApiAdminConfig"
  },
  {
    "type": "post",
    "url": "/api/admin/config/search",
    "title": "Search config API",
    "group": "Admin_Config",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get config search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"value\": \"\",\n   \"type\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/config/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminConfigController.ts",
    "groupTitle": "Admin_Config",
    "name": "PostApiAdminConfigSearch"
  },
  {
    "type": "put",
    "url": "/api/admin/config/:name",
    "title": "Edit config API",
    "group": "Admin_Config",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name *</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>value</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>type as a value class type such as boolean, string, integer *</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"value\" : \"\",\n     \"type\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully edit config.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminConfigController.ts",
    "groupTitle": "Admin_Config",
    "name": "PutApiAdminConfigName"
  },
  {
    "type": "delete",
    "url": "/api/admin/hashtag/:id",
    "title": "Delete HashTag API",
    "group": "Admin_HashTag",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete HashTag.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/hashtag/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete HashTag Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminHashTagController.ts",
    "groupTitle": "Admin_HashTag",
    "name": "DeleteApiAdminHashtagId"
  },
  {
    "type": "get",
    "url": "/api/admin/hashTag/:id",
    "title": "Find Admin HashTag API",
    "group": "Admin_HashTag",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Admin HashTag\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/hashTag/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminHashTagController.ts",
    "groupTitle": "Admin_HashTag",
    "name": "GetApiAdminHashtagId"
  },
  {
    "type": "post",
    "url": "/api/admin/hashTag",
    "title": "Create HashTag API",
    "group": "Admin_HashTag",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create HashTag\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/hashTag"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create HashTag",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminHashTagController.ts",
    "groupTitle": "Admin_HashTag",
    "name": "PostApiAdminHashtag"
  },
  {
    "type": "put",
    "url": "/api/admin/hashTag/:id",
    "title": "Update HashTag API",
    "group": "Admin_HashTag",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated HashTag.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/hashTag/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update HashTag error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminHashTagController.ts",
    "groupTitle": "Admin_HashTag",
    "name": "PutApiAdminHashtagId"
  },
  {
    "type": "post",
    "url": "/api/admin/log",
    "title": "Create Search History API",
    "group": "Admin_Log",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Search Admin Log Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/log"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Admin Log Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminUserActionLogsController.ts",
    "groupTitle": "Admin_Log",
    "name": "PostApiAdminLog"
  },
  {
    "type": "delete",
    "url": "/api/admin/page_category/:id",
    "title": "Delete PageCategory API",
    "group": "Admin_PageCategory",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete PageCategory.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/page_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete PageCategory Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageCategoryController.ts",
    "groupTitle": "Admin_PageCategory",
    "name": "DeleteApiAdminPage_categoryId"
  },
  {
    "type": "post",
    "url": "/api/admin/page_category",
    "title": "Create PageCategory API",
    "group": "Admin_PageCategory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"description\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Create PageCategory\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/page_category"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Create PageCategory",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageCategoryController.ts",
    "groupTitle": "Admin_PageCategory",
    "name": "PostApiAdminPage_category"
  },
  {
    "type": "put",
    "url": "/api/admin/page_category/:id",
    "title": "Update PageCategory API",
    "group": "Admin_PageCategory",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated PageCategory.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/page_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update PageCategory error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageCategoryController.ts",
    "groupTitle": "Admin_PageCategory",
    "name": "PutApiAdminPage_categoryId"
  },
  {
    "type": "post",
    "url": "/api/admin/page/:id/approve",
    "title": "Approve Page API",
    "group": "Admin_Page_API",
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Approve Official Page Success\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/page/:id/approve"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Approve Official Page Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageController.ts",
    "groupTitle": "Admin_Page_API",
    "name": "PostApiAdminPageIdApprove"
  },
  {
    "type": "post",
    "url": "/api/admin/page/:id/ban",
    "title": "Ban Page API",
    "group": "Admin_Page_API",
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Ban Page Success\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/page/:id/ban"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Ban Page Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageController.ts",
    "groupTitle": "Admin_Page_API",
    "name": "PostApiAdminPageIdBan"
  },
  {
    "type": "post",
    "url": "/api/admin/page/:id/unapprove",
    "title": "UnApprove Page API",
    "group": "Admin_Page_API",
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"UnApprove Official Page Success\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/page/:id/unapprove"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UnApprove Official Page Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageController.ts",
    "groupTitle": "Admin_Page_API",
    "name": "PostApiAdminPageIdUnapprove"
  },
  {
    "type": "delete",
    "url": "/api/admin/item/:id",
    "title": "Delete StandardItem API",
    "group": "Admin_StandardItem",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete StandardItem.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete StandardItem Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemController.ts",
    "groupTitle": "Admin_StandardItem",
    "name": "DeleteApiAdminItemId"
  },
  {
    "type": "get",
    "url": "/api/admin/item/:id",
    "title": "Find Admin StandardItem API",
    "group": "Admin_StandardItem",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Admin StandardItem\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemController.ts",
    "groupTitle": "Admin_StandardItem",
    "name": "GetApiAdminItemId"
  },
  {
    "type": "post",
    "url": "/api/admin/item",
    "title": "Create StandardItem API",
    "group": "Admin_StandardItem",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"category\" : [\n         {\n             \"name\": \"\",\n             \"description\": \"\"\n         }\n     ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create StandardItem\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create StandardItem",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemController.ts",
    "groupTitle": "Admin_StandardItem",
    "name": "PostApiAdminItem"
  },
  {
    "type": "post",
    "url": "/api/admin/item_request",
    "title": "Create StandardItem Request API",
    "group": "Admin_StandardItem",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create StandardItem Request\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_request"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create StandardItem Request",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemRequestController.ts",
    "groupTitle": "Admin_StandardItem",
    "name": "PostApiAdminItem_request"
  },
  {
    "type": "post",
    "url": "/api/admin/item_request/approve",
    "title": "Approve StandardItem Request API",
    "group": "Admin_StandardItem",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"isApprove\" : \"boolean\",\n     \"description\": \"string\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Approve/Upapprove StandardItem Request\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_request"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create StandardItem Request",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemRequestController.ts",
    "groupTitle": "Admin_StandardItem",
    "name": "PostApiAdminItem_requestApprove"
  },
  {
    "type": "put",
    "url": "/api/admin/item/:id",
    "title": "Update StandardItem API",
    "group": "Admin_StandardItem",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated StandardItem.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update StandardItem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemController.ts",
    "groupTitle": "Admin_StandardItem",
    "name": "PutApiAdminItemId"
  },
  {
    "type": "put",
    "url": "/api/admin/item_request/:id",
    "title": "Update StandardItem Request API",
    "group": "Admin_StandardItem",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated StandardItem Request.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_request/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update StandardItem Request error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemRequestController.ts",
    "groupTitle": "Admin_StandardItem",
    "name": "PutApiAdminItem_requestId"
  },
  {
    "type": "get",
    "url": "/api/admin/item_request/:id",
    "title": "Find Admin StandardItemRequest API",
    "group": "Admin_StandardItemRequest",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully getting StandardItemRequest\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/standarditem/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemRequestController.ts",
    "groupTitle": "Admin_StandardItemRequest",
    "name": "GetApiAdminItem_requestId"
  },
  {
    "type": "delete",
    "url": "/api/admin/item_request/:id",
    "title": "Delete StandardItem Request API",
    "group": "Admin_StandardItem_Request",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete StandardItem Request.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_request/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete StandardItem Request Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemRequestController.ts",
    "groupTitle": "Admin_StandardItem_Request",
    "name": "DeleteApiAdminItem_requestId"
  },
  {
    "type": "post",
    "url": "/api/allocate",
    "title": "Calculate Allocate API",
    "group": "Allocate",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Calculate Allocate\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/allocate/calculate"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Calculate Allocate error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/AllocateController.ts",
    "groupTitle": "Allocate",
    "name": "PostApiAllocate"
  },
  {
    "type": "post",
    "url": "/api/allocate/search",
    "title": "Search Allocate API",
    "group": "Allocate",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Search Allocate\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/allocate/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Allocate error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/AllocateController.ts",
    "groupTitle": "Allocate",
    "name": "PostApiAllocateSearch"
  },
  {
    "type": "delete",
    "url": "/api/temp",
    "title": "Delete temp API",
    "group": "Asset",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete temp.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/temp"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete temp Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/AssetsController.ts",
    "groupTitle": "Asset",
    "name": "DeleteApiTemp"
  },
  {
    "type": "get",
    "url": "/api/file/:id",
    "title": "Find Asset API",
    "group": "Asset",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Asset\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/asset/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Asset error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/AssetsController.ts",
    "groupTitle": "Asset",
    "name": "GetApiFileId"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "src/api/apidoc/main.js",
    "group": "C:\\Absolute\\spanboon-github\\api-spanboon\\src\\api\\apidoc\\main.js",
    "groupTitle": "C:\\Absolute\\spanboon-github\\api-spanboon\\src\\api\\apidoc\\main.js",
    "name": ""
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "src/public/apidoc/main.js",
    "group": "C:\\Absolute\\spanboon-github\\api-spanboon\\src\\public\\apidoc\\main.js",
    "groupTitle": "C:\\Absolute\\spanboon-github\\api-spanboon\\src\\public\\apidoc\\main.js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/api/chat/:id",
    "title": "Create Chat Message to User room",
    "group": "Chat",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>message</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Created chat message\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/chat/user/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "chat message error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ChatController.ts",
    "groupTitle": "Chat",
    "name": "PostApiChatId"
  },
  {
    "type": "post",
    "url": "/api/chat/read",
    "title": "Mark Read Chat Message",
    "group": "Chat",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String[]",
            "optional": false,
            "field": "messageId",
            "description": "<p>messageId</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Created chat message\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/chat/read"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "chat message error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ChatController.ts",
    "groupTitle": "Chat",
    "name": "PostApiChatRead"
  },
  {
    "type": "get",
    "url": "/api/chatroom/:id/message",
    "title": "Finding chat by User room API",
    "group": "ChatRoom",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n     {\n     \"message\": \"Successfully got chats\",\n     \"data\":{\n     \"name\" : \"\",\n     \"link\" : \"\",\n     \"logo_url\" : \"\" \n     }\n     \"status\": \"1\"\n     }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/chatroom/:id/message"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "chat error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ChatRoomController.ts",
    "groupTitle": "ChatRoom",
    "name": "GetApiChatroomIdMessage"
  },
  {
    "type": "get",
    "url": "/api/chatroom/list",
    "title": "List Chat Room",
    "group": "ChatRoom",
    "parameter": {
      "fields": {
        "Request param": [
          {
            "group": "Request param",
            "type": "String",
            "optional": false,
            "field": "asPageId",
            "description": "<p>asPageId</p>"
          },
          {
            "group": "Request param",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request param",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully List chat message\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/chatroom/list"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "chat message error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ChatRoomController.ts",
    "groupTitle": "ChatRoom",
    "name": "GetApiChatroomList"
  },
  {
    "type": "post",
    "url": "/api/chatroom/",
    "title": "Create Chat Room",
    "group": "ChatRoom",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>message</p>"
          },
          {
            "group": "Request body",
            "type": "any",
            "optional": false,
            "field": "asset",
            "description": "<p>asset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "videoURL",
            "description": "<p>videoURL</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Created chat message\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/chatroom/"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "chat message error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ChatRoomController.ts",
    "groupTitle": "ChatRoom",
    "name": "PostApiChatroom"
  },
  {
    "type": "post",
    "url": "/api/chatroom/check_unread",
    "title": "Check Chat Room unread message",
    "group": "ChatRoom",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "roomIds",
            "description": "<p>roomIds</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Check Chat Room unread Message\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/chatroom/check_unread"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "chat message error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ChatRoomController.ts",
    "groupTitle": "ChatRoom",
    "name": "PostApiChatroomCheck_unread"
  },
  {
    "type": "post",
    "url": "/api/chatroom/:id",
    "title": "Create Chat Message to User room",
    "group": "ChatRoom",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>message</p>"
          },
          {
            "group": "Request body",
            "type": "any",
            "optional": false,
            "field": "asset",
            "description": "<p>asset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "videoURL",
            "description": "<p>videoURL</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Created chat message\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/chatroom/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "chat message error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ChatRoomController.ts",
    "groupTitle": "ChatRoom",
    "name": "PostApiChatroomId"
  },
  {
    "type": "get",
    "url": "/api/config/:name",
    "title": "Pageuser Find Config API",
    "group": "Config",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n     {\n     \"message\": \"Successfully get Config Details\",\n     \"data\":{\n     \"name\" : \"\",\n     \"link\" : \"\",\n     \"logo_url\" : \"\"\n     }\n     \"status\": \"1\"\n     }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ConfigController.ts",
    "groupTitle": "Config",
    "name": "GetApiConfigName"
  },
  {
    "type": "post",
    "url": "/api/config/search",
    "title": "Search Config API",
    "group": "Config",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get config search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/config/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/ConfigController.ts",
    "groupTitle": "Config",
    "name": "PostApiConfigSearch"
  },
  {
    "type": "post",
    "url": "/api/admin/customitem/search",
    "title": "Search CustomItem API",
    "group": "CustomItem",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get emergencyEvent search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/customitem/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search CustomItem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminCustomItemController.ts",
    "groupTitle": "CustomItem",
    "name": "PostApiAdminCustomitemSearch"
  },
  {
    "type": "delete",
    "url": "/api/admin/emergency/:id",
    "title": "Delete EmergencyEvent API",
    "group": "EmergencyEvent",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete EmergencyEvent.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/emergency/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete EmergencyEvent Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminEmergencyEventController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "DeleteApiAdminEmergencyId"
  },
  {
    "type": "get",
    "url": "/api/admin/emergency/:id",
    "title": "Find EmergencyEvent API",
    "group": "EmergencyEvent",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get EmergencyEvent\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/emergency/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "EmergencyEvent error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminEmergencyEventController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "GetApiAdminEmergencyId"
  },
  {
    "type": "get",
    "url": "/api/emergency/:id",
    "title": "Find EmergencyEvent API",
    "group": "EmergencyEvent",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get EmergencyEvent\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/emergency/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "EmergencyEvent error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/EmergencyEventController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "GetApiEmergencyId"
  },
  {
    "type": "post",
    "url": "/api/admin/customitem",
    "title": "Create EmergencyEvent API",
    "group": "EmergencyEvent",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"category\" : [\n         {\n             \"name\": \"\",\n             \"description\": \"\"\n         }\n     ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create EmergencyEvent\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/customitem"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create EmergencyEvent",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminCustomItemController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "PostApiAdminCustomitem"
  },
  {
    "type": "post",
    "url": "/api/admin/emergency",
    "title": "Create EmergencyEvent API",
    "group": "EmergencyEvent",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"category\" : [\n         {\n             \"name\": \"\",\n             \"description\": \"\"\n         }\n     ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create EmergencyEvent\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/emergency"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create EmergencyEvent",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminEmergencyEventController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "PostApiAdminEmergency"
  },
  {
    "type": "post",
    "url": "/api/admin/emergency/search",
    "title": "Search EmergencyEvent API",
    "group": "EmergencyEvent",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get emergencyEvent search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/emergency/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search EmergencyEvent error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminEmergencyEventController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "PostApiAdminEmergencySearch"
  },
  {
    "type": "post",
    "url": "/api/emergency/search",
    "title": "Search EmergencyEvent API",
    "group": "EmergencyEvent",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get emergencyEvent search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/emergency/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search EmergencyEvent error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/EmergencyEventController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "PostApiEmergencySearch"
  },
  {
    "type": "put",
    "url": "/api/admin/emergency/:id",
    "title": "Update EmergencyEvent API",
    "group": "EmergencyEvent",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated EmergencyEvent.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/emergency/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update EmergencyEvent error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminEmergencyEventController.ts",
    "groupTitle": "EmergencyEvent",
    "name": "PutApiAdminEmergencyId"
  },
  {
    "type": "delete",
    "url": "/api/fulfillment_case/:id",
    "title": "Delete FulfillmentCase",
    "group": "FulfillmentCase",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Delete FulfillmentCase Success\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "FulfillmentCase",
    "name": "DeleteApiFulfillment_caseId"
  },
  {
    "type": "delete",
    "url": "/api/fulfillment_case/:id",
    "title": "Delete FulfillmentCase",
    "group": "FulfillmentCase",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Delete FulfillmentCase Success\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "FulfillmentCase",
    "name": "DeleteApiFulfillment_caseId"
  },
  {
    "type": "delete",
    "url": "/api/fulfillment/:id",
    "title": "Delete Fulfillment API",
    "group": "Fulfillment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete Fulfillment.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete Fulfillment Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentController.ts",
    "groupTitle": "Fulfillment",
    "name": "DeleteApiFulfillmentId"
  },
  {
    "type": "get",
    "url": "/api/fulfillment/:id",
    "title": "Find Fulfillment API",
    "group": "Fulfillment",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Fulfillment\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Fulfillment error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentController.ts",
    "groupTitle": "Fulfillment",
    "name": "GetApiFulfillmentId"
  },
  {
    "type": "post",
    "url": "/api/fulfillment",
    "title": "Create Fulfillment API",
    "group": "Fulfillment",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"category\" : [\n         {\n             \"name\": \"\",\n             \"description\": \"\"\n         }\n     ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create Fulfillment\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create Fulfillment",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentController.ts",
    "groupTitle": "Fulfillment",
    "name": "PostApiFulfillment"
  },
  {
    "type": "post",
    "url": "/api/fulfillment/search",
    "title": "Search Fulfillment API",
    "group": "Fulfillment",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get fulfillment search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Fulfillment error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentController.ts",
    "groupTitle": "Fulfillment",
    "name": "PostApiFulfillmentSearch"
  },
  {
    "type": "put",
    "url": "/api/fulfillment/:id",
    "title": "Update Fulfillment API",
    "group": "Fulfillment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated Fulfillment.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update Fulfillment error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentController.ts",
    "groupTitle": "Fulfillment",
    "name": "PutApiFulfillmentId"
  },
  {
    "type": "delete",
    "url": "/api/fulfillment_case/:caseId/request/:requestId",
    "title": "Edit FulfillmentRequest",
    "group": "FulfillmentRequest",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Edit FulfillmentRequest Success\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId/request/:requestId"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Edit FulfillmentRequest Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "FulfillmentRequest",
    "name": "DeleteApiFulfillment_caseCaseidRequestRequestid"
  },
  {
    "type": "delete",
    "url": "/api/fulfillment_case/:caseId/confirm",
    "title": "Cancel Confirm FulfillmentCase API",
    "group": "Fulfillment_Case",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Cancel Confirm FulfillmentCase Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId/confirm"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Create FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "Fulfillment_Case",
    "name": "DeleteApiFulfillment_caseCaseidConfirm"
  },
  {
    "type": "post",
    "url": "/api/fulfillment_case",
    "title": "Create FulfillmentCase API",
    "group": "Fulfillment_Case",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Create FulfillmentCase Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Create FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "Fulfillment_Case",
    "name": "PostApiFulfillment_case"
  },
  {
    "type": "post",
    "url": "/api/fulfillment_case/:caseId/allocate_confirm",
    "title": "Confirm FulfillmentCase API for page mode",
    "group": "Fulfillment_Case",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Confirm FulfillmentCase Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId/allocate_confirm"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Confirm FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "Fulfillment_Case",
    "name": "PostApiFulfillment_caseCaseidAllocate_confirm"
  },
  {
    "type": "post",
    "url": "/api/fulfillment_case/:caseId/cancel",
    "title": "Cancel FulfillmentCase API",
    "group": "Fulfillment_Case",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Cancel FulfillmentCase Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId/cancel"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cancel FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "Fulfillment_Case",
    "name": "PostApiFulfillment_caseCaseidCancel"
  },
  {
    "type": "post",
    "url": "/api/fulfillment_case/:caseId/confirm",
    "title": "Confirm FulfillmentCase API for Post mode",
    "group": "Fulfillment_Case",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Confirm FulfillmentCase Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId/confirm"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Confirm FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "Fulfillment_Case",
    "name": "PostApiFulfillment_caseCaseidConfirm"
  },
  {
    "type": "post",
    "url": "/api/fulfillment_case/:caseId/fulfill",
    "title": "Create Fulfillment From case API",
    "group": "Fulfillment_Case",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Create FulfillmentCase Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId/fulfill"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Create FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "Fulfillment_Case",
    "name": "PostApiFulfillment_caseCaseidFulfill"
  },
  {
    "type": "post",
    "url": "/api/fulfillment_case/:caseId/request",
    "title": "Create FulfillmentCase API",
    "group": "Fulfillment_Case",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Create FulfillmentCase Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId/request"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Create FulfillmentCase Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "Fulfillment_Case",
    "name": "PostApiFulfillment_caseCaseidRequest"
  },
  {
    "type": "get",
    "url": "/api/file/:id/image",
    "title": "Resize Image On The Fly",
    "group": "Get_Image_File_API",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": \"Successfully resize image\",\n  \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/media/image-resize"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "media error",
          "content": "HTTP/1.1 500 Internal Server Error\n{\n    \"message\": \"Unable to resize the image\",\n    \"status\": 0,\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/AssetsController.ts",
    "groupTitle": "Get_Image_File_API",
    "name": "GetApiFileIdImage"
  },
  {
    "type": "post",
    "url": "/api/change_password",
    "title": "Change Password",
    "group": "Guest_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>Activation Code</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"username\" : \"\",\n     \"code\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Change Password Success\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/change_password"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/GuestController.ts",
    "groupTitle": "Guest_API",
    "name": "PostApiChange_password"
  },
  {
    "type": "post",
    "url": "/api/forgot",
    "title": "Forgot Password",
    "group": "Guest_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"username\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Thank you. Your password send to your email\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/forgot"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/GuestController.ts",
    "groupTitle": "Guest_API",
    "name": "PostApiForgot"
  },
  {
    "type": "post",
    "url": "/api/login",
    "title": "Login",
    "group": "Guest_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>User Username</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>User Password</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"username\" : \"\",\n     \"password\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"data\": {\n        \"token\": \"\"\n     },\n     \"message\": \"Successfully login\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/login"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/GuestController.ts",
    "groupTitle": "Guest_API",
    "name": "PostApiLogin"
  },
  {
    "type": "post",
    "url": "/api/register",
    "title": "Create User",
    "group": "Guest_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>username</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": "<p>firstName</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": "<p>lastName</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "citizenId",
            "description": "<p>citizenId</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "gender",
            "description": "<p>gender</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"username\" : \"\",\n     \"password\" : \"\",\n     \"email\" : \"\",\n     \"firstname\" : \"\",\n     \"lastname\" : \"\",\n     \"citizenId\" : \"\",\n     \"gender\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create User\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/register"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/GuestController.ts",
    "groupTitle": "Guest_API",
    "name": "PostApiRegister"
  },
  {
    "type": "get",
    "url": "/api/hashtag/:id",
    "title": "Find HashTag API",
    "group": "HashTag",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get HashTag\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/hashtag/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "HashTag error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/HashTagController.ts",
    "groupTitle": "HashTag",
    "name": "GetApiHashtagId"
  },
  {
    "type": "post",
    "url": "/api/admin/hashtag/search",
    "title": "Search HashTag API",
    "group": "HashTag",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get hashTag search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/hashtag/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "hashTag error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminHashTagController.ts",
    "groupTitle": "HashTag",
    "name": "PostApiAdminHashtagSearch"
  },
  {
    "type": "post",
    "url": "/api/hashtag/:id/post/search",
    "title": "Search HashTag In Post API",
    "group": "HashTag",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get hashTag search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/hashtag/:id/post/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "hashTag error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/HashTagController.ts",
    "groupTitle": "HashTag",
    "name": "PostApiHashtagIdPostSearch"
  },
  {
    "type": "post",
    "url": "/api/hashtag/search",
    "title": "Search HashTag API",
    "group": "HashTag",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get hashTag search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/hashtag/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "hashTag error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/HashTagController.ts",
    "groupTitle": "HashTag",
    "name": "PostApiHashtagSearch"
  },
  {
    "type": "post",
    "url": "/api/hashtag/trend",
    "title": "Search Trend HashTag API",
    "group": "HashTag",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get hashTag search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/hashtag/trend"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "hashTag error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/HashTagController.ts",
    "groupTitle": "HashTag",
    "name": "PostApiHashtagTrend"
  },
  {
    "type": "post",
    "url": "/api/jobs/extended_token",
    "title": "Extended page token API",
    "group": "Jobs",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully request token\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/twitter/request_token"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/JobsController.ts",
    "groupTitle": "Jobs",
    "name": "PostApiJobsExtended_token"
  },
  {
    "type": "get",
    "url": "/api/fulfillment_case/:caseId",
    "title": "Find Main Page Data API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Page\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/:caseId"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiFulfillment_caseCaseid"
  },
  {
    "type": "get",
    "url": "/api/fulfillment_case/list",
    "title": "Find Main Page Data API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Page\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/list"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiFulfillment_caseList"
  },
  {
    "type": "get",
    "url": "/api/fulfillment_case/list",
    "title": "Find Main Page Data API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Page\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/list"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiFulfillment_caseList"
  },
  {
    "type": "get",
    "url": "/api/fulfillment_case/post/:postId",
    "title": "Find Main Page Data API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Page\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/fulfillment_case/post/:postId"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/FulfillmentCaseController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiFulfillment_casePostPostid"
  },
  {
    "type": "get",
    "url": "/api/main/account",
    "title": "Find Main Page Data API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Get User Or Page Success\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/main/account"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot Get User Or Page ",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/MainPageController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiMainAccount"
  },
  {
    "type": "get",
    "url": "/api/main/content",
    "title": "Find Main Page Data API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Page\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/main/content"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/MainPageController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiMainContent"
  },
  {
    "type": "get",
    "url": "/api/main/content/search",
    "title": "Search API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Search Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/main/content/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/MainPageController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiMainContentSearch"
  },
  {
    "type": "get",
    "url": "/api/main/search",
    "title": "Search API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Search Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/main/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/MainPageController.ts",
    "groupTitle": "MainPage",
    "name": "GetApiMainSearch"
  },
  {
    "type": "post",
    "url": "/api/main/account/search",
    "title": "Search Main Page Data API",
    "group": "MainPage",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Get User Or Page Success\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/main/account/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot Get User Or Page ",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/MainPageController.ts",
    "groupTitle": "MainPage",
    "name": "PostApiMainAccountSearch"
  },
  {
    "type": "delete",
    "url": "/api/needs/:id",
    "title": "Delete Needs API",
    "group": "Needs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete Needs.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/needs/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete Needs Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/NeedsController.ts",
    "groupTitle": "Needs",
    "name": "DeleteApiNeedsId"
  },
  {
    "type": "get",
    "url": "/api/needs/:id",
    "title": "Find Needs API",
    "group": "Needs",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Needs\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/needs/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Needs error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/NeedsController.ts",
    "groupTitle": "Needs",
    "name": "GetApiNeedsId"
  },
  {
    "type": "get",
    "url": "/api/needs/lastest",
    "title": "Find Lastest Needs API",
    "group": "Needs",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get  Needs\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/needs/lastest"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Needs error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/NeedsController.ts",
    "groupTitle": "Needs",
    "name": "GetApiNeedsLastest"
  },
  {
    "type": "post",
    "url": "/api/needs",
    "title": "Create Needs API",
    "group": "Needs",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"category\" : [\n         {\n             \"name\": \"\",\n             \"description\": \"\"\n         }\n     ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create Needs\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/needs"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create Needs",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/NeedsController.ts",
    "groupTitle": "Needs",
    "name": "PostApiNeeds"
  },
  {
    "type": "post",
    "url": "/api/needs/search",
    "title": "Search Needs API",
    "group": "Needs",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get needs search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/needs/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Needs error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/NeedsController.ts",
    "groupTitle": "Needs",
    "name": "PostApiNeedsSearch"
  },
  {
    "type": "put",
    "url": "/api/needs/:id",
    "title": "Update Needs API",
    "group": "Needs",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated Needs.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/needs/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update Needs error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/NeedsController.ts",
    "groupTitle": "Needs",
    "name": "PutApiNeedsId"
  },
  {
    "type": "get",
    "url": "/api/page_category/:id",
    "title": "Find PageCategory API",
    "group": "PageCategory",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get PageCategory\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageCategoryController.ts",
    "groupTitle": "PageCategory",
    "name": "GetApiPage_categoryId"
  },
  {
    "type": "post",
    "url": "/api/page_category/:id/follow",
    "title": "Follow Page Category API",
    "group": "PageCategory",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Follow Page\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page_category/:id/follow"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Follow Page Category Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageCategoryController.ts",
    "groupTitle": "PageCategory",
    "name": "PostApiPage_categoryIdFollow"
  },
  {
    "type": "post",
    "url": "/api/page_category/search",
    "title": "Search PageCategory API",
    "group": "PageCategory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search Page Category\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page_category/post/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Page Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageCategoryController.ts",
    "groupTitle": "PageCategory",
    "name": "PostApiPage_categorySearch"
  },
  {
    "type": "delete",
    "url": "/api/page/:id",
    "title": "Delete Page API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete Page.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete Page Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "DeleteApiPageId"
  },
  {
    "type": "delete",
    "url": "/api/page/:id/access/:accessid",
    "title": "Delete Page API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully remove User Page Access\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/access/:accessid"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "DeleteApiPageIdAccessAccessid"
  },
  {
    "type": "delete",
    "url": "/api/page/:id/config/:name",
    "title": "Delete Page Config API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete Page.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete Page Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "DeleteApiPageIdConfigName"
  },
  {
    "type": "Delete",
    "url": "/api/page/:id/social/facebook",
    "title": "Unbinding Page Social API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Unbinding Page Social\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/social/facebook"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable to Unbinding Page Social",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "DeleteApiPageIdSocialFacebook"
  },
  {
    "type": "delete",
    "url": "/api/page/:id/social/twitter",
    "title": "UnBinding Page Social API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully UnBinding Page Social\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/social/twitter"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Binding Page Social",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "DeleteApiPageIdSocialTwitter"
  },
  {
    "type": "delete",
    "url": "/api/user/config/:name",
    "title": "Delete Page Config API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete Page.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete Page Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "Page",
    "name": "DeleteApiUserConfigName"
  },
  {
    "type": "get",
    "url": "/api/page/:id",
    "title": "Find Page API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Page\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "GetApiPageId"
  },
  {
    "type": "get",
    "url": "/api/page/:id/access",
    "title": "Find Page API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully got PageAccessLV\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/access"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "GetApiPageIdAccess"
  },
  {
    "type": "get",
    "url": "/api/page/:id/accesslv",
    "title": "Find Page API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully got PageAccessLV\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/accesslv"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "GetApiPageIdAccesslv"
  },
  {
    "type": "get",
    "url": "/api/page/:id/config",
    "title": "Get Page Config API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Get Page.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/config"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Get Page Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "GetApiPageIdConfig"
  },
  {
    "type": "get",
    "url": "/api/page/:id/needs",
    "title": "Get Page Needs API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Get Page Needs\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/needs"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Get Page Needs",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "GetApiPageIdNeeds"
  },
  {
    "type": "Get",
    "url": "/api/page/:id/social/facebook/check",
    "title": "Check if Page Social Facebook binding API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Facebook Page Acount found\",\n     \"data\": true\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/social/facebook/check"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Binding Page Social",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "GetApiPageIdSocialFacebookCheck"
  },
  {
    "type": "Get",
    "url": "/api/page/:id/social/twitter/check",
    "title": "Check if Page Social Twitter binding API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Twitter Page Acount found\",\n     \"data\": true\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/social/twitter/check"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Binding Page Social",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "GetApiPageIdSocialTwitterCheck"
  },
  {
    "type": "delete",
    "url": "/api/admin/objective_category/:id",
    "title": "Delete PageObjectiveCategory API",
    "group": "PageObjectiveCategory",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete PageObjectiveCategory.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/objective_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete PageObjectiveCategory Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageObjectiveCategoryController.ts",
    "groupTitle": "PageObjectiveCategory",
    "name": "DeleteApiAdminObjective_categoryId"
  },
  {
    "type": "post",
    "url": "/api/admin/objective_category",
    "title": "Create PageObjectiveCategory API",
    "group": "PageObjectiveCategory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"description\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create PageObjectiveCategory\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/objective_category"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create PageObjectiveCategory",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageObjectiveCategoryController.ts",
    "groupTitle": "PageObjectiveCategory",
    "name": "PostApiAdminObjective_category"
  },
  {
    "type": "put",
    "url": "/api/admin/objective_category/:id",
    "title": "Update PageObjectiveCategory API",
    "group": "PageObjectiveCategory",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated PageObjectiveCategory.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/objective_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update PageObjectiveCategory error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageObjectiveCategoryController.ts",
    "groupTitle": "PageObjectiveCategory",
    "name": "PutApiAdminObjective_categoryId"
  },
  {
    "type": "delete",
    "url": "/api/objective/:id",
    "title": "Delete PageObjective API",
    "group": "PageObjective",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete PageObjective.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete PageObjective Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveController.ts",
    "groupTitle": "PageObjective",
    "name": "DeleteApiObjectiveId"
  },
  {
    "type": "get",
    "url": "/api/objective/:id",
    "title": "Find PageObjective API",
    "group": "PageObjective",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get PageObjective\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PageObjective error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveController.ts",
    "groupTitle": "PageObjective",
    "name": "GetApiObjectiveId"
  },
  {
    "type": "post",
    "url": "/api/objective",
    "title": "Create PageObjective API",
    "group": "PageObjective",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"category\" : [\n         {\n             \"name\": \"\",\n             \"description\": \"\"\n         }\n     ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create PageObjective\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create PageObjective",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveController.ts",
    "groupTitle": "PageObjective",
    "name": "PostApiObjective"
  },
  {
    "type": "post",
    "url": "/api/objective/search",
    "title": "Search PageObjective API",
    "group": "PageObjective",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get objective search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search PageObjective error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveController.ts",
    "groupTitle": "PageObjective",
    "name": "PostApiObjectiveSearch"
  },
  {
    "type": "put",
    "url": "/api/objective/:id",
    "title": "Update PageObjective API",
    "group": "PageObjective",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated PageObjective.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update PageObjective error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveController.ts",
    "groupTitle": "PageObjective",
    "name": "PutApiObjectiveId"
  },
  {
    "type": "get",
    "url": "/api/objective_category/:id",
    "title": "Find PageObjective Category API",
    "group": "PageObjective_Category",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get PageObjective Category\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PageObjective Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveCategoryController.ts",
    "groupTitle": "PageObjective_Category",
    "name": "GetApiObjective_categoryId"
  },
  {
    "type": "post",
    "url": "/api/admin/objective_category/search",
    "title": "Search PageObjective Category API",
    "group": "PageObjective_Category_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search PageObjective Category\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/objective_category/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PageObjective Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminPageObjectiveCategoryController.ts",
    "groupTitle": "PageObjective_Category_API",
    "name": "PostApiAdminObjective_categorySearch"
  },
  {
    "type": "post",
    "url": "/api/objective_category/search",
    "title": "Search PageObjective Category API",
    "group": "PageObjective_Category_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search PageObjective Category\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective_category/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PageObjective Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveCategoryController.ts",
    "groupTitle": "PageObjective_Category_API",
    "name": "PostApiObjective_categorySearch"
  },
  {
    "type": "post",
    "url": "/api/history/search",
    "title": "Search History API",
    "group": "Page",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search History\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/history/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "History Not Found",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/SearchHistoryController.ts",
    "groupTitle": "Page",
    "name": "PostApiHistorySearch"
  },
  {
    "type": "post",
    "url": "/api/page",
    "title": "Create Page API",
    "group": "Page",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"category\" : [\n         {\n             \"name\": \"\",\n             \"description\": \"\"\n         }\n     ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create Page\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create Page",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPage"
  },
  {
    "type": "post",
    "url": "/api/page/:id/access",
    "title": "Add Page Access API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully adding User Page Access\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/access"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdAccess"
  },
  {
    "type": "post",
    "url": "/api/page/:id/access",
    "title": "Delete Page API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully remove User Page Access\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/access"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdAccess"
  },
  {
    "type": "post",
    "url": "/api/page/:id/config/:name",
    "title": "Create Page Config API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Create Page.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Create Page Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdConfigName"
  },
  {
    "type": "post",
    "url": "/api/page/:id/follow",
    "title": "Follow Page API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Follow Page Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/follow"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdFollow"
  },
  {
    "type": "post",
    "url": "/api/page/:id/objective",
    "title": "Get Page PageObjective API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Get Page PageObjective\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/objective"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Get Page PageObjective",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdObjective"
  },
  {
    "type": "post",
    "url": "/api/page/:id/post/search",
    "title": "Search PagePost API",
    "group": "Page",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get PagePost search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/post/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search PagePost error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdPostSearch"
  },
  {
    "type": "post",
    "url": "/api/page/:id/social/facebook",
    "title": "Binding Page Social API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Binding Page Social\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/social/facebook"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Binding Page Social",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdSocialFacebook"
  },
  {
    "type": "post",
    "url": "/api/page/:id/social/twitter",
    "title": "Binding Page Social API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Binding Page Social\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/social/twitter"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Binding Page Social",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageIdSocialTwitter"
  },
  {
    "type": "post",
    "url": "/api/page/search",
    "title": "Search Page API",
    "group": "Page",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get page search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PostApiPageSearch"
  },
  {
    "type": "post",
    "url": "/api/post/:id/comment/search",
    "title": "Search PostComment API",
    "group": "Page",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get PagePost search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:id/comment/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Post Comment error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsCommentController.ts",
    "groupTitle": "Page",
    "name": "PostApiPostIdCommentSearch"
  },
  {
    "type": "post",
    "url": "/api/user/:id/post/search",
    "title": "Search PagePost API",
    "group": "Page",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get PagePost search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/:id/post/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search PagePost error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProfileController.ts",
    "groupTitle": "Page",
    "name": "PostApiUserIdPostSearch"
  },
  {
    "type": "delete",
    "url": "/api/page/:pageId/post/:postId",
    "title": "Delete PagePost API",
    "group": "PagePost",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete PagePost.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post/:postId"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete PagePost Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "PagePost",
    "name": "DeleteApiPagePageidPostPostid"
  },
  {
    "type": "delete",
    "url": "/api/page/:pageId/post/:postId/tag",
    "title": "Delete PagePost HashTag API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "[\n     {\n         name: ''\n     },\n     {\n         name: ''\n     }\n]",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Delete PagePost HashTag\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post/:postId/tag"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Delete PagePost Hashtag",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "PagePost",
    "name": "DeleteApiPagePageidPostPostidTag"
  },
  {
    "type": "delete",
    "url": "/api/post/:postId/needs",
    "title": "Remove PagePost Needs API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String[]",
            "optional": false,
            "field": "needs",
            "description": "<p>needs</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"needs\": [\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Remove PagePost Needs Successful\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/needs"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot Remove PagePost Needs",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "PagePost",
    "name": "DeleteApiPostPostidNeeds"
  },
  {
    "type": "get",
    "url": "/api/page/:pageId/post/:id",
    "title": "PagePost List API",
    "group": "PagePost",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get PagePost\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PagePost error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "PagePost",
    "name": "GetApiPagePageidPostId"
  },
  {
    "type": "get",
    "url": "/api/page/:pageId/post/:id",
    "title": "PagePost List API",
    "group": "PagePost",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get PagePost\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PagePost error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "PagePost",
    "name": "GetApiPagePageidPostId"
  },
  {
    "type": "get",
    "url": "/api/post/:postId/needs",
    "title": "Get PagePost Needs API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String[]",
            "optional": false,
            "field": "needs",
            "description": "<p>needs</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"needs\": [\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Remove PagePost Needs Successful\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/needs"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot Remove PagePost Needs",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "PagePost",
    "name": "GetApiPostPostidNeeds"
  },
  {
    "type": "get",
    "url": "/api/post/:postId/recommended_hashtag",
    "title": "Get PagePost Needs API",
    "group": "PagePost",
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"needs\": [\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Get PagePost Recommended Story Successful\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/recommended_hashtag"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot get PagePost Recommended Story",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "PagePost",
    "name": "GetApiPostPostidRecommended_hashtag"
  },
  {
    "type": "get",
    "url": "/api/post/:postId/recommended_story",
    "title": "Get PagePost Needs API",
    "group": "PagePost",
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"needs\": [\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Get PagePost Recommended Story Successful\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/recommended_story"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot get PagePost Recommended Story",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "PagePost",
    "name": "GetApiPostPostidRecommended_story"
  },
  {
    "type": "get",
    "url": "/api/recommend/story",
    "title": "Get Page story API",
    "group": "PagePost",
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"needs\": [\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Get PagePost Recommended Story Successful\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/recommend/story"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot get PagePost Recommended Story",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/RecommendController.ts",
    "groupTitle": "PagePost",
    "name": "GetApiRecommendStory"
  },
  {
    "type": "get",
    "url": "/api/user",
    "title": "User List API",
    "group": "PagePost",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Get Users\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Get Users Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "PagePost",
    "name": "GetApiUser"
  },
  {
    "type": "post",
    "url": "/api/file/temp",
    "title": "Create Temp File API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"title\": \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create PagePost\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create PagePost",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/AssetsController.ts",
    "groupTitle": "PagePost",
    "name": "PostApiFileTemp"
  },
  {
    "type": "post",
    "url": "/api/page/:pageId/post",
    "title": "Create PagePost API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"title\": \"\",\n     \"detail\": \"\",\n     \"hidden\": \"\",\n     \"type\": \"\",\n     \"referenceMode\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create PagePost\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create PagePost",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "PagePost",
    "name": "PostApiPagePageidPost"
  },
  {
    "type": "post",
    "url": "/api/page/:pageId/post/:postId/tag",
    "title": "Add PagePost HashTag API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "[\n     {\n         name: ''\n     },\n     {\n         name: ''\n     }\n]",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Create PagePost HashTag\",\n     \"data\": {}\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post/:postId/tag"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot Create PagePost HashTag",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "PagePost",
    "name": "PostApiPagePageidPostPostidTag"
  },
  {
    "type": "post",
    "url": "/api/post/:postId/needs",
    "title": "Add PagePost Needs API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String[]",
            "optional": false,
            "field": "needs",
            "description": "<p>needs</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"needs\": [\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Add PagePost Needs\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/needs"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable PagePost Needs",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "PagePost",
    "name": "PostApiPostPostidNeeds"
  },
  {
    "type": "post",
    "url": "/api/post/:postId/repost",
    "title": "Share PagePost API",
    "group": "PagePost",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"title\": \"\",\n     \"detail\": \"\",\n     \"hidden\": \"\",\n     \"type\": \"\",\n     \"referenceMode\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Shared PagePost\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/repost"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Shared PagePost",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "PagePost",
    "name": "PostApiPostPostidRepost"
  },
  {
    "type": "post",
    "url": "/api/post/:postId/repost/undo",
    "title": "Undo Repost API",
    "group": "PagePost",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Unde Repost Success\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/repost/undo"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Undo Repost Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "PagePost",
    "name": "PostApiPostPostidRepostUndo"
  },
  {
    "type": "put",
    "url": "/api/page/:pageId/post/:postId",
    "title": "Update PagePost API",
    "group": "PagePost",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"title\": \"\",\n     \"detail\": \"\",\n     \"hidden\": \"\",\n     \"type\": \"\",\n     \"referenceMode\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated PagePost.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:pageId/post/:postId"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update PagePost error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PagePostController.ts",
    "groupTitle": "PagePost",
    "name": "PutApiPagePageidPostPostid"
  },
  {
    "type": "put",
    "url": "/api/page/:id",
    "title": "Update Page API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated Page.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PutApiPageId"
  },
  {
    "type": "put",
    "url": "/api/page/:id/access/:accessid",
    "title": "Edit Page Access API",
    "group": "Page",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully adding User Page Access\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/access/:accessid"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PutApiPageIdAccessAccessid"
  },
  {
    "type": "put",
    "url": "/api/page/:id/config/:name",
    "title": "Edit Page Config API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Edit Page.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Edit Page Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "Page",
    "name": "PutApiPageIdConfigName"
  },
  {
    "type": "put",
    "url": "/api/user/config/:name",
    "title": "Edit Page Config API",
    "group": "Page",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Edit Page.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Edit Page Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "Page",
    "name": "PutApiUserConfigName"
  },
  {
    "type": "get",
    "url": "/api/check_status",
    "title": "Check UserStatus with token",
    "group": "PageUser",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Mode",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Facebook User Token</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"data\": \"{\n        \"user\":''\n     }\",\n     \"message\": \"Account was valid\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/check_status"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "User Token error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/GuestController.ts",
    "groupTitle": "PageUser",
    "name": "GetApiCheck_status"
  },
  {
    "type": "get",
    "url": "/api/page/category/:name",
    "title": "PageCategory List API",
    "group": "Page_Category",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Page Category\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/category"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PageCategory Profile error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageCategoryController.ts",
    "groupTitle": "Page_Category",
    "name": "GetApiPageCategoryName"
  },
  {
    "type": "post",
    "url": "/api/page/category",
    "title": "Create PageCategory API",
    "group": "Page_Category",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"description\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create PageCategory\",\n     \"data\":{\n         \"id\" : \"\",\n         \"name\" : \"\",\n         \"description\" : \"\",\n     }\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/category"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create PageCategory",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageCategoryController.ts",
    "groupTitle": "Page_Category",
    "name": "PostApiPageCategory"
  },
  {
    "type": "get",
    "url": "/api/post/count/max",
    "title": "Get Count Max Post API",
    "group": "Post",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Get Count Success\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/count/max"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Get Count Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "Post",
    "name": "GetApiPostCountMax"
  },
  {
    "type": "get",
    "url": "/api/post/new",
    "title": "New PostPage API",
    "group": "Post",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Get New Post\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/new"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Get New Post Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "Post",
    "name": "GetApiPostNew"
  },
  {
    "type": "post",
    "url": "/api/post/:id/like",
    "title": "Like PagePost API",
    "group": "Post",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Like PagePost Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:id/like"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Like PagePost error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "Post",
    "name": "PostApiPostIdLike"
  },
  {
    "type": "post",
    "url": "/api/post/search",
    "title": "Search Post API",
    "group": "Post",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          },
          {
            "group": "Request body",
            "type": "boolean",
            "optional": false,
            "field": "count",
            "description": "<p>count (0=false, 1=true)</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search Post\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Search Post error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsController.ts",
    "groupTitle": "Post",
    "name": "PostApiPostSearch"
  },
  {
    "type": "delete",
    "url": "/api/post/:postId/comment/:commentId",
    "title": "Delete PostsComment API",
    "group": "PostsComment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete PostsComment.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/comment/:commentId"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete PostsComment Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsCommentController.ts",
    "groupTitle": "PostsComment",
    "name": "DeleteApiPostPostidCommentCommentid"
  },
  {
    "type": "get",
    "url": "/api/post/:postId/comment",
    "title": "PostsComment List API",
    "group": "PostsComment",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get PostsComment\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/comment"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "PostsComment error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsCommentController.ts",
    "groupTitle": "PostsComment",
    "name": "GetApiPostPostidComment"
  },
  {
    "type": "post",
    "url": "/api/post/:postId/comment/like",
    "title": "Like PostsComment API",
    "group": "PostsComment",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "comment",
            "description": "<p>Comment</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"comment\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create PostsComment\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/comment/like"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create PostsComment",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsCommentController.ts",
    "groupTitle": "PostsComment",
    "name": "PostApiPostPostidCommentLike"
  },
  {
    "type": "post",
    "url": "/api/post/:postId/comment/status",
    "title": "Get PostsComment Status API",
    "group": "PostsComment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Get PostsComment Status.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/comment/status"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Get PostsComment Status Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsCommentController.ts",
    "groupTitle": "PostsComment",
    "name": "PostApiPostPostidCommentStatus"
  },
  {
    "type": "post",
    "url": "/api/post/:postId/comment/tag",
    "title": "Add PostsComment HashTag API",
    "group": "PostsComment",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "comment",
            "description": "<p>Comment</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"comment\" : \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create PostsComment\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/comment/tag"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create PostsComment",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsCommentController.ts",
    "groupTitle": "PostsComment",
    "name": "PostApiPostPostidCommentTag"
  },
  {
    "type": "put",
    "url": "/api/post/:postId/comment/:commentId",
    "title": "Update PostsComment API",
    "group": "PostsComment",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "comment",
            "description": "<p>comment</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"comment\": \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated PostsComment.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/post/:postId/comment/:commentId"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update PostsComment error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PostsCommentController.ts",
    "groupTitle": "PostsComment",
    "name": "PutApiPostPostidCommentCommentid"
  },
  {
    "type": "post",
    "url": "/api/history",
    "title": "Create Search History API",
    "group": "SearchHistory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>userId</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "keyword",
            "description": "<p>keyword</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "resultId",
            "description": "<p>resultId</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "resultType",
            "description": "<p>resultType</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"status\": \"1\",\n   \"message\": \"Create History Success\",\n   \"data\":{\n     \"userId\" : \"\",\n     \"ip\": \"\",\n     \"keyword\": \"\",\n     \"resultId\": \"\",\n     \"resultType\": \"\",\n     \"createdDate\": \"\",\n     \"createdTime\": \"\",\n     \"id\" : \"\"\n    }\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/history"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Create History Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/SearchHistoryController.ts",
    "groupTitle": "SearchHistory",
    "name": "PostApiHistory"
  },
  {
    "type": "post",
    "url": "/api/history/clear",
    "title": "ClearAll Search History API",
    "group": "SearchHistory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>userId</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"status\": \"1\",\n   \"message\": \"Clear All History Success\",\n   \"data\":{\n     \"userId\" : \"\",\n     \"ip\": \"\",\n     \"keyword\": \"\",\n     \"resultId\": \"\",\n     \"resultType\": \"\",\n     \"createdDate\": \"\",\n     \"createdTime\": \"\",\n     \"id\" : \"\"\n    }\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/history/clear"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Clear All History Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/SearchHistoryController.ts",
    "groupTitle": "SearchHistory",
    "name": "PostApiHistoryClear"
  },
  {
    "type": "post",
    "url": "/api/history/:id/clear",
    "title": "Clear Search History By Id API",
    "group": "SearchHistory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>userId</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"status\": \"1\",\n   \"message\": \"Clear History Success\",\n   \"data\":{\n     \"userId\" : \"\",\n     \"ip\": \"\",\n     \"keyword\": \"\",\n     \"resultId\": \"\",\n     \"resultType\": \"\",\n     \"createdDate\": \"\",\n     \"createdTime\": \"\",\n     \"id\" : \"\"\n    }\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/history/:id/clear"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Clear History Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/SearchHistoryController.ts",
    "groupTitle": "SearchHistory",
    "name": "PostApiHistoryIdClear"
  },
  {
    "type": "delete",
    "url": "/api/admin/item_category/:id",
    "title": "Delete StandardItemCategory API",
    "group": "StandardItemCategory",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Delete StandardItemCategory.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Delete StandardItemCategory Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemCategoryController.ts",
    "groupTitle": "StandardItemCategory",
    "name": "DeleteApiAdminItem_categoryId"
  },
  {
    "type": "post",
    "url": "/api/admin/item_category",
    "title": "Create StandardItemCategory API",
    "group": "StandardItemCategory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"description\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create StandardItemCategory\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_category"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create StandardItemCategory",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemCategoryController.ts",
    "groupTitle": "StandardItemCategory",
    "name": "PostApiAdminItem_category"
  },
  {
    "type": "post",
    "url": "/api/admin/item_category",
    "title": "Create StandardItemCategory API",
    "group": "StandardItemCategory",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n     \"description\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create StandardItemCategory\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_category"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create StandardItemCategory",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemCategoryController.ts",
    "groupTitle": "StandardItemCategory",
    "name": "PostApiAdminItem_category"
  },
  {
    "type": "post",
    "url": "/api/item_category/:id/follow",
    "title": "Follow StandardItem Category API",
    "group": "StandardItemCategory",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Follow StandardItem Category Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Follow StandardItem Category Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemCategoryController.ts",
    "groupTitle": "StandardItemCategory",
    "name": "PostApiItem_categoryIdFollow"
  },
  {
    "type": "post",
    "url": "/api/item_category/:id/follow",
    "title": "Follow StandardItem Category API",
    "group": "StandardItemCategory",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Follow StandardItem Category Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Follow StandardItem Category Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemCategoryController.ts",
    "groupTitle": "StandardItemCategory",
    "name": "PostApiItem_categoryIdFollow"
  },
  {
    "type": "post",
    "url": "/api/objective_category/:id/follow",
    "title": "Follow PageObjective Category API",
    "group": "StandardItemCategory",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Follow PageObjective Category Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/objective_category/:id/follow"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Follow PageObjective Category Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageObjectiveCategoryController.ts",
    "groupTitle": "StandardItemCategory",
    "name": "PostApiObjective_categoryIdFollow"
  },
  {
    "type": "put",
    "url": "/api/admin/item_category/:id",
    "title": "Update StandardItemCategory API",
    "group": "StandardItemCategory",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>name name</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"name\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully updated StandardItemCategory.\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Update StandardItemCategory error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemCategoryController.ts",
    "groupTitle": "StandardItemCategory",
    "name": "PutApiAdminItem_categoryId"
  },
  {
    "type": "get",
    "url": "/api/item/:id",
    "title": "Find StandardItem API",
    "group": "StandardItem",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get StandardItem\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "StandardItem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemController.ts",
    "groupTitle": "StandardItem",
    "name": "GetApiItemId"
  },
  {
    "type": "get",
    "url": "/api/item_request/:id",
    "title": "Find StandardItemRequest API",
    "group": "StandardItem",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get StandardItem\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item_request/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "StandardItem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemRequestController.ts",
    "groupTitle": "StandardItem",
    "name": "GetApiItem_requestId"
  },
  {
    "type": "post",
    "url": "/api/admin/item/search",
    "title": "Search StandardItem API",
    "group": "StandardItem_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get standarditem search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "standarditem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemController.ts",
    "groupTitle": "StandardItem_API",
    "name": "PostApiAdminItemSearch"
  },
  {
    "type": "post",
    "url": "/api/item/search",
    "title": "Search StandardItem API",
    "group": "StandardItem_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get standarditem search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "standarditem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemController.ts",
    "groupTitle": "StandardItem_API",
    "name": "PostApiItemSearch"
  },
  {
    "type": "post",
    "url": "/api/item/searchmerge",
    "title": "Search StandardItem API",
    "group": "StandardItem_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get standarditem search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item/searchmerge"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "standarditem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemController.ts",
    "groupTitle": "StandardItem_API",
    "name": "PostApiItemSearchmerge"
  },
  {
    "type": "post",
    "url": "/api/item_request/",
    "title": "Request to Create StandardItem API",
    "group": "StandardItem_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get standarditem search\",\n   \"data\":{\n   \"name\" : \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item_request/"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "standarditem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemRequestController.ts",
    "groupTitle": "StandardItem_API",
    "name": "PostApiItem_request"
  },
  {
    "type": "post",
    "url": "/api/item_request/search",
    "title": "Search StandardItemRequest API",
    "group": "StandardItem_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get standarditem search\",\n   \"data\":{\n     \"limit\" : \"number\",\n     \"offset\": \"number\",\n     \"select\": \"any\",\n     \"relation\": \"any\",\n     \"whereConditions\": \"any\",\n     \"orderBy\": \"any\",\n     \"count\": \"any\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item_request/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "standarditem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemRequestController.ts",
    "groupTitle": "StandardItem_API",
    "name": "PostApiItem_requestSearch"
  },
  {
    "type": "put",
    "url": "/api/item_request/:id",
    "title": "Request to Create StandardItem API",
    "group": "StandardItem_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>name</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get standarditem search\",\n   \"data\":{\n   \"name\" : \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item_request/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "standarditem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemRequestController.ts",
    "groupTitle": "StandardItem_API",
    "name": "PutApiItem_requestId"
  },
  {
    "type": "get",
    "url": "/api/item_category/:id",
    "title": "Find StandardItem Category API",
    "group": "StandardItem_Category",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get StandardItem Category\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "StandardItem Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemCategoryController.ts",
    "groupTitle": "StandardItem_Category",
    "name": "GetApiItem_categoryId"
  },
  {
    "type": "get",
    "url": "/api/admin/item_category/:id",
    "title": "Search StandardItem Category API",
    "group": "StandardItem_Category_API",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search StandardItem Category\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_category/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "StandardItem Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemCategoryController.ts",
    "groupTitle": "StandardItem_Category_API",
    "name": "GetApiAdminItem_categoryId"
  },
  {
    "type": "post",
    "url": "/api/admin/item_category/search",
    "title": "Search StandardItem Category API",
    "group": "StandardItem_Category_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search StandardItem Category\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_category/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "StandardItem Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemCategoryController.ts",
    "groupTitle": "StandardItem_Category_API",
    "name": "PostApiAdminItem_categorySearch"
  },
  {
    "type": "post",
    "url": "/api/item_category/search",
    "title": "Search StandardItem Category API",
    "group": "StandardItem_Category_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Search StandardItem Category\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/item_category/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "StandardItem Category error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/StandardItemCategoryController.ts",
    "groupTitle": "StandardItem_Category_API",
    "name": "PostApiItem_categorySearch"
  },
  {
    "type": "post",
    "url": "/api/admin/item_request/search",
    "title": "Search StandardItem Request API",
    "group": "StandardItem_Request_API",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get standarditem search\",\n   \"data\":{\n     \"limit\" : \"number\",\n     \"offset\": \"number\",\n     \"select\": \"any\",\n     \"relation\": \"any\",\n     \"whereConditions\": \"any\",\n     \"orderBy\": \"any\",\n     \"count\": \"any\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/admin/item_request/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "standarditem error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/admin/AdminStandardItemRequestController.ts",
    "groupTitle": "StandardItem_Request_API",
    "name": "PostApiAdminItem_requestSearch"
  },
  {
    "type": "get",
    "url": "/api/twitter/access_token",
    "title": "Search Config API",
    "group": "Twitter",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get access token\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/twitter/access_token"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/TwitterController.ts",
    "groupTitle": "Twitter",
    "name": "GetApiTwitterAccess_token"
  },
  {
    "type": "post",
    "url": "/api/twitter/account_verify",
    "title": "account_verify API",
    "group": "Twitter",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get account_verify\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/twitter/account_verify"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/TwitterController.ts",
    "groupTitle": "Twitter",
    "name": "PostApiTwitterAccount_verify"
  },
  {
    "type": "post",
    "url": "/api/twitter/request_token",
    "title": "Search Config API",
    "group": "Twitter",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully request token\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/twitter/request_token"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "config error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/TwitterController.ts",
    "groupTitle": "Twitter",
    "name": "PostApiTwitterRequest_token"
  },
  {
    "type": "get",
    "url": "/api/recommend/",
    "title": "Get Recommend API",
    "group": "UserAccess",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get Recommend\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/recommend"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/RecommendController.ts",
    "groupTitle": "UserAccess",
    "name": "GetApiRecommend"
  },
  {
    "type": "get",
    "url": "/api/useraccess/page/",
    "title": "Get User Page Access API",
    "group": "UserAccess",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get User Page Access\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/useraccess/page"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Page error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserAccessController.ts",
    "groupTitle": "UserAccess",
    "name": "GetApiUseraccessPage"
  },
  {
    "type": "get",
    "url": "/api/user/:id/account",
    "title": "Get UserAccount",
    "group": "UserAccount",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Get UserAccount\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/:id/account"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Get UserAccount error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserAccountController.ts",
    "groupTitle": "UserAccount",
    "name": "GetApiUserIdAccount"
  },
  {
    "type": "post",
    "url": "/api/engagement",
    "title": "Create UserEngagement API",
    "group": "UserEngagement",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "contentId",
            "description": "<p>contentId</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "contentType",
            "description": "<p>contentType</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "action",
            "description": "<p>action</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "reference",
            "description": "<p>reference</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Create UserEngagement\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/engagement"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserEngagement error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserEngagementController.ts",
    "groupTitle": "UserEngagement",
    "name": "PostApiEngagement"
  },
  {
    "type": "get",
    "url": "/api/user/config/:name",
    "title": "Get User Config API",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Get User Config.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Get User Config Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "User",
    "name": "GetApiUserConfigName"
  },
  {
    "type": "delete",
    "url": "/api/notification",
    "title": "Delete UserNotifications API",
    "group": "UserNotifications",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Delete UserNotifications\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/notification/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserNotifications error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserNotificationController.ts",
    "groupTitle": "UserNotifications",
    "name": "DeleteApiNotification"
  },
  {
    "type": "delete",
    "url": "/api/notification/:id",
    "title": "Delete UserNotifications API",
    "group": "UserNotifications",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Delete UserNotifications\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/notification/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserNotifications error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserNotificationController.ts",
    "groupTitle": "UserNotifications",
    "name": "DeleteApiNotificationId"
  },
  {
    "type": "get",
    "url": "/api/notification",
    "title": "list UnRead UserNotifications API",
    "group": "UserNotifications",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get UserNotifications\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/notification"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserNotifications error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserNotificationController.ts",
    "groupTitle": "UserNotifications",
    "name": "GetApiNotification"
  },
  {
    "type": "get",
    "url": "/api/notification/:id",
    "title": "Find UserNotifications API",
    "group": "UserNotifications",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get UserNotifications\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/notification/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserNotifications error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserNotificationController.ts",
    "groupTitle": "UserNotifications",
    "name": "GetApiNotificationId"
  },
  {
    "type": "post",
    "url": "/api/notification/clear",
    "title": "Clear All Notifications API",
    "group": "UserNotifications",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully Clear All Notifications\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/notification/clear"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "userNotifications error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserNotificationController.ts",
    "groupTitle": "UserNotifications",
    "name": "PostApiNotificationClear"
  },
  {
    "type": "post",
    "url": "/api/notification/:id/read",
    "title": "Mark Read UserNotifications API",
    "group": "UserNotifications",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Delete UserNotifications\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/notification/:id/read"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserNotifications error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserNotificationController.ts",
    "groupTitle": "UserNotifications",
    "name": "PostApiNotificationIdRead"
  },
  {
    "type": "post",
    "url": "/api/notification/search",
    "title": "Search UserNotifications API",
    "group": "UserNotifications",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get userNotifications search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/notification/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "userNotifications error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserNotificationController.ts",
    "groupTitle": "UserNotifications",
    "name": "PostApiNotificationSearch"
  },
  {
    "type": "post",
    "url": "/api/user/config/:name",
    "title": "Create User Config API",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"id\" : \"\",\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n\"message\": \"Successfully Create User Config.\",\n\"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/config/:name"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Create User Config Error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "User",
    "name": "PostApiUserConfigName"
  },
  {
    "type": "post",
    "url": "/api/user/:id/follow",
    "title": "Follow User API",
    "group": "User",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Follow User Success\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/:id/follow"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Follow User error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "User",
    "name": "PostApiUserIdFollow"
  },
  {
    "type": "post",
    "url": "/api/user/logout",
    "title": "Log Out API",
    "group": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully logout\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/logout"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Logout error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "User",
    "name": "PostApiUserLogout"
  },
  {
    "type": "get",
    "url": "/api/image/cover",
    "title": "Edit Image API",
    "group": "UserProfile",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Edit Image Successfully\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/image/cover"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Edit Image Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProfileController.ts",
    "groupTitle": "UserProfile",
    "name": "GetApiImageCover"
  },
  {
    "type": "get",
    "url": "/api/page/:id/cover",
    "title": "Edit Cover API",
    "group": "UserProfile",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Edit Cover Successfully\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/cover"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Edit Cover Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "UserProfile",
    "name": "GetApiPageIdCover"
  },
  {
    "type": "get",
    "url": "/api/page/:id/image",
    "title": "Edit Image API",
    "group": "UserProfile",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Edit Image Successfully\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/page/:id/image"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Edit Image Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/PageController.ts",
    "groupTitle": "UserProfile",
    "name": "GetApiPageIdImage"
  },
  {
    "type": "get",
    "url": "/api/profile",
    "title": "Get UserPageProfile",
    "group": "UserProfile",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Get UserPageProfile\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/profile"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Logout error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProfileController.ts",
    "groupTitle": "UserProfile",
    "name": "GetApiProfile"
  },
  {
    "type": "get",
    "url": "/api/profile/cover",
    "title": "Edit Cover API",
    "group": "UserProfile",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Edit Cover Successfully\",\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/profile/cover"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Edit Cover Failed",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProfileController.ts",
    "groupTitle": "UserProfile",
    "name": "GetApiProfileCover"
  },
  {
    "type": "put",
    "url": "/api/profile/:id",
    "title": "Update User Profile API",
    "group": "UserProfile",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "displayName",
            "description": ""
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "firstName",
            "description": ""
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "lastName",
            "description": ""
          },
          {
            "group": "Request body",
            "type": "Date",
            "optional": false,
            "field": "birthdate",
            "description": ""
          },
          {
            "group": "Request body",
            "type": "Number",
            "optional": false,
            "field": "gender",
            "description": ""
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "customGender",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     \"displayName\" : \"\",\n     \"firstName\" : \"\",\n     \"lastName\" : \"\",\n     \"birthdate\" : \"\",\n     \"gender\" : \"\",\n     \"customGender\" : \"\"\n     \n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Update UserProfile Successful\",\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/profile/:id"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Cannot Update UserProfile",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProfileController.ts",
    "groupTitle": "UserProfile",
    "name": "PutApiProfileId"
  },
  {
    "type": "get",
    "url": "/api/user/:id/item",
    "title": "Find UserProvideItems API",
    "group": "UserProvideItems",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get UserProvideItems\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/:id/item"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserProvideItems error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProvidetemsController.ts",
    "groupTitle": "UserProvideItems",
    "name": "GetApiUserIdItem"
  },
  {
    "type": "get",
    "url": "/api/user/:id/item",
    "title": "Find UserProvideItems API",
    "group": "UserProvideItems",
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully get UserProvideItems\"\n     \"data\":\"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/:id/item"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "UserProvideItems error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProvidetemsController.ts",
    "groupTitle": "UserProvideItems",
    "name": "GetApiUserIdItem"
  },
  {
    "type": "post",
    "url": "/api/item/search",
    "title": "Search UserProvideItems API",
    "group": "UserProvideItems",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "limit",
            "description": "<p>limit</p>"
          },
          {
            "group": "Request body",
            "type": "number",
            "optional": false,
            "field": "offset",
            "description": "<p>offset</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "select",
            "description": "<p>select</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "relation",
            "description": "<p>relation</p>"
          },
          {
            "group": "Request body",
            "type": "String",
            "optional": false,
            "field": "whereConditions",
            "description": "<p>whereConditions</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Successfully get userProvideItems search\",\n   \"data\":{\n   \"name\" : \"\",\n   \"description\": \"\",\n    }\n   \"status\": \"1\"\n }",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/:id/item/search"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "userProvideItems error",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserProvidetemsController.ts",
    "groupTitle": "UserProvideItems",
    "name": "PostApiItemSearch"
  },
  {
    "type": "post",
    "url": "/api/user/item",
    "title": "Create UserProvideItems API",
    "group": "UserProvideItems",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String[]",
            "optional": false,
            "field": "standardItemId",
            "description": "<p>standardItemId</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     [\"\",\"\",....,\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully create UserProvideItems\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/item"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable create UserProvideItems",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "UserProvideItems",
    "name": "PostApiUserItem"
  },
  {
    "type": "put",
    "url": "/api/user/:id/item",
    "title": "Update UserProvideItems API",
    "group": "UserProvideItems",
    "parameter": {
      "fields": {
        "Request body": [
          {
            "group": "Request body",
            "type": "String[]",
            "optional": false,
            "field": "standardItemId",
            "description": "<p>standardItemId</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Input",
          "content": "{\n     [\"\",\"\",....,\"\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success",
          "content": "HTTP/1.1 200 OK\n{\n     \"message\": \"Successfully Update UserProvideItems\",\n     \"data\": \"{}\"\n     \"status\": \"1\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "/api/user/:id/item"
      }
    ],
    "error": {
      "examples": [
        {
          "title": "Unable Update UserProvideItems",
          "content": "HTTP/1.1 500 Internal Server Error",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/controllers/UserController.ts",
    "groupTitle": "UserProvideItems",
    "name": "PutApiUserIdItem"
  }
] });
