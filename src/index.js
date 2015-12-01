"use strict"

import wire from 'wire';
import coreSpec from './core.spec';

let test = 123;

wire(coreSpec).then( context => {
		console.log(context);
	}
)