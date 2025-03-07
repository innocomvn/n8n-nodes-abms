import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class AbmsNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ABMS',
    name: 'abmsNode',
    group: ['transform'],
    version: 1,
    subtitle: '={{ $parameter["operation"] }}',
    description: 'ABMS Node',
    icon: 'file:abms.svg',
    defaults: {
      name: 'Abms',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'AbmsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        required: true,
        noDataExpression: true,
        options: [
          {
            name: 'Create',
            value: 'create',
          },
          {
            name: 'Delete',
            value: 'delete',
          },
          {
            name: 'Describe',
            value: 'describe',
          },
          {
            name: 'Extend Session',
            value: 'extend_session',
          },
          {
            name: 'List Types',
            value: 'listtypes',
          },
          {
            name: 'Login',
            value: 'login',
          },
          {
            name: 'Logout',
            value: 'logout',
          },
          {
            name: 'Query',
            value: 'query',
          },
          {
            name: 'Retrieve',
            value: 'retrieve',
          },
          {
            name: 'Sync',
            value: 'sync',
          },
          {
            name: 'Update',
            value: 'update',
          },
        ],
        default: 'login',
      },
      {
        displayName: 'Session Name',
        name: 'session_name_field',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          hide: {
            operation: ['login'],
          },
        },
        placeholder: 'Obtained through Login Operation',
      },
      {
        displayName: 'Element',
        name: 'element_field',
        type: 'json',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['create', 'update']
          }
        }
      },
      {
        displayName: 'Element Type',
        name: 'elementType_field',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: ['create', 'describe']
          }
        }
      },
      {
        displayName: 'Webservice ID',
        name: 'webservice_id_field',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: ['retrieve', 'delete']
          }
        }
      },
      {
        displayName: 'Query',
        name: 'query_field',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: ['query']
          }
        },
        typeOptions: {
          rows: 4,
        },
      },
    ],
  };

  /**
    * Executes the ABMS operation based on the provided parameters.
    * This function performs various operations such as creating, deleting, describing, extending session, listing types,
    * logging in, logging out, querying, retrieving, and updating data in the ABMS.
    * 
    * @returns A promise that resolves to an array of node execution data.
    */
  /**
   * Executes the ABMS CRM operation based on the provided parameters.
   * @returns A promise that resolves to an array of node execution data.
   */
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    let operation = this.getNodeParameter('operation', 0);
    let credential = await this.getCredentials('AbmsApi')

    let response = null;

    switch (operation) {
      case 'create':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: {
            operation: 'create',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
            elementType: this.getNodeParameter('elementType_field', 0) as string,
            element: this.getNodeParameter('element_field', 0),
          },
          json: true,
        });
        break;
      case 'delete':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: {
            operation: 'delete',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
            id: this.getNodeParameter('webservice_id_field', 0) as string,
          },
          json: true,
        });
        break;
      case 'describe':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'GET',
          qs: {
            operation: 'describe',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
            elementType: this.getNodeParameter('elementType_field', 0) as string,
          },
          json: true,
        });
        break;
      case 'extend_session':
        throw new NodeOperationError(this.getNode(), operation + ' operation is not implemented.');
      //   response = await this.helpers.httpRequest({
      //     baseURL: credential?.host as string,
      //     url: '/webservice.php',
      //     method: 'GET',
      //     qs: {
      //       operation: 'extend_session',
      //       sessionName: this.getNodeParameter('session_name_field', 0) as string,
      //     },
      //     json: true,
      //   });
      //   break;
      case 'listtypes':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'GET',
          qs: {
            operation: 'listtypes',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
          },
          json: true,
        });
        break;
      case 'login':
        const challenge_response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'GET',
          qs: {
            operation: 'getchallenge',
            username: credential?.username as string,
          },
          json: true,
        });

        if (challenge_response?.success) {
          const CryptoJS = require("crypto-js");
          response = await this.helpers.httpRequest({
            baseURL: credential?.host as string,
            url: '/webservice.php',
            method: 'POST',
            headers: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            body: {
              operation: 'login',
              username: credential?.username as string,
              accessKey: CryptoJS.MD5(challenge_response?.result?.token + credential?.access_key)
            },
            json: true,
          });

        } else {
          throw new NodeOperationError(this.getNode(), challenge_response.error.message + ' (' + challenge_response.error.code + ')');
        }
        break;
      case 'logout':
        throw new NodeOperationError(this.getNode(), operation + ' operation is not implemented.');
      //   response = await this.helpers.httpRequest({
      //     baseURL: credential?.host as string,
      //     url: '/webservice.php',
      //     method: 'POST',
      //     headers: {
      //       'content-type': 'application/x-www-form-urlencoded'
      //     },
      //     body: {
      //       operation: 'logout',
      //       sessionName: this.getNodeParameter('session_name_field', 0) as string,
      //     },
      //     json: true,
      //   });
      //   break;
      case 'listtypes':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: {
            operation: 'listtypes',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
          },
          json: true,
        });
        break;
      case 'query':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'GET',
          qs: {
            operation: 'query',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
            query: this.getNodeParameter('query_field', 0) as string,
          },
          json: true,
        });
        break;
      case 'retrieve':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'GET',
          qs: {
            operation: 'retrieve',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
            id: this.getNodeParameter('webservice_id_field', 0) as string,
          },
          json: true,
        });
        break;
      case 'sync':
        throw new NodeOperationError(this.getNode(), operation + ' operation is not implemented.');
      //   response = await this.helpers.httpRequest({
      //     baseURL: credential?.host as string,
      //     url: '/webservice.php',
      //     method: 'POST',
      //     headers: {
      //         'content-type': 'application/x-www-form-urlencoded'
      //     },
      //     body: {
      //         operation: 'sync',
      //         sessionName: this.getNodeParameter('session_name_field', 0) as string,
      //     },
      //     json:true,
      // });
      // break;
      case 'update':
        response = await this.helpers.httpRequest({
          baseURL: credential?.host as string,
          url: '/webservice.php',
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: {
            operation: 'update',
            sessionName: this.getNodeParameter('session_name_field', 0) as string,
            element: this.getNodeParameter('element_field', 0),
          },
          json: true,
        });
        break;
      default:
        throw new NodeOperationError(this.getNode(), operation + ' operation is not implemented.');
    }

    return [this.helpers.returnJsonArray(response)];
  }
}
