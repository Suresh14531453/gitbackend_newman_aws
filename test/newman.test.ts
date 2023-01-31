 import * as cdk from 'aws-cdk-lib';
 import { Template } from 'aws-cdk-lib/assertions';
 import * as Newman from '../lib/newman-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/newman-stack.ts
test('SQS Queue Created', () => {
const app = new cdk.App();
//     // WHEN
 const stack = new Newman.NewmanStack(app, 'MyTestStack');
//     // THEN
//   const template = Template.fromStack(stack);
// expect(Template.fromStack(stack).toJSON()).toMatchSnapshot();

//   template.hasResourceProperties('AWS::SQS::Queue', {
//     VisibilityTimeout: 300
//   });
});
