import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AbmsApi implements ICredentialType {
	name = 'abmsApi';
	displayName = 'ABMS Credentials API';
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			required: true,
			default: '',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			required: true,
			default: '',
		},
		{
			displayName: 'Access Key',
			name: 'access_key',
			type: 'string',
			required: true,
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
