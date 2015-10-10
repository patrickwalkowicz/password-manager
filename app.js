var storage = require('node-persist');
storage.initSync();

var crypto = require('crypto-js');

// Create user interface
var argv = require('yargs')
	.command('create', 'Adds a new account to the database', function(yargs) {
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Name of the account (eg. Facebook)',
				type: 'string'
			},
			username: {
				demand: true,
				alias: 'u',
				description: 'Username for the account',
				type: 'string'
			},
			password: {
				demand: true,
				alias: 'p',
				description: 'Password for the account',
				type: 'string'
			},
			masterpassword: {
				demand: true,
				alias: 'm',
				description: 'Master password (for encryption purposes)',
				type: 'string'
			}
		}).help('help')
	})
	.help('help')
	.command('get', 'Retreives an account from the database', function(yargs) {
		yargs.options({
			name: {
				demand: true,
				alias: 'n',
				description: 'Name of the account (eg. Facebook)',
				type: 'string'
			},
			masterpassword: {
				demand: true,
				alias: 'm',
				description: 'Master password (for encryption purposes)',
				type: 'string'
			}
		}).help('help')
	})
	.help('help')
	.argv

var command = argv._[0];

// account.name - string
// account.username - string
// account.password

function getAccounts(masterPassword) {
	// Use getItemSync to fetch accounts
	var accounts = storage.getItemSync('accounts');
	if (typeof accounts === "undefined") {
		accounts = [];
		return accounts;
	}
	// Decrypt
	var bytes = crypto.AES.decrypt(accounts, masterPassword);
	accounts = JSON.parse(bytes.toString(crypto.enc.Utf8));
	// Return accounts array
	return accounts;
}

function saveAccounts(accounts, masterPassword) {
	var encryptedAccounts = crypto.AES.encrypt(JSON.stringify(accounts), masterPassword);
	storage.setItemSync('accounts', encryptedAccounts.toString());
}

function createAccount (account, masterPassword) {
	var accounts = getAccounts(masterPassword);
	accounts.push(account);
	saveAccounts(accounts, masterPassword);
	return account;
}

function getAccount (accountName, masterPassword) {
	var matchHelper;
	var accounts = getAccounts(masterPassword);
	accounts.forEach(function(account) {
		if (account.name === accountName) {
			matchHelper = account;
		}
	});
	return matchHelper;
}

// Act on user commands
if (command === "create") {
	try {
		var account = {name: argv.name, username: argv.username, password: argv.password};
		createAccount(account, argv.masterpassword);
		console.log("Account successfully created!")
	} catch(e) {
		console.log("Unable to create account.")
	}

}
if (command === "get") {
	try {
		var account = getAccount(argv.name, argv.masterpassword);
		if (typeof account === "undefined") {
			console.log("Account not found!")
		}
		else {
			console.log('Account: ' + account.name);
			console.log('Username: ' + account.username);
			console.log('Password: ' + account.password);
		}	
	} catch(e) {
		console.log("Unable to get account from the database.");
	}
}

