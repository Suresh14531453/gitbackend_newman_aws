import * as cdk from 'aws-cdk-lib';
import { SecretValue } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NewmanStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const pipeline = new Pipeline(this, "newmanPipeline", {
      pipelineName: 'newmanpipeline',
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    })
    // const testProject = new PipelineProject(this, 'TestProject', {
    //   buildSpec: BuildSpec.fromSourceFilename(
    //     "build-specs/cdk-newman-spec.yml"
    //   )
    // })
    const cdkSourceOutput = new Artifact("CDKSourceOutput")
    pipeline.addStage({
      stageName: "Source",
      actions:
        [
          new GitHubSourceAction({
            owner: "Suresh14531453",
            repo: "gitbackend_newman_aws",
            branch: "master",
            actionName: "Pipeline_Source",
            oauthToken: SecretValue.secretsManager("token_access"),
            output: cdkSourceOutput
          }),
        ],
    })
    const cdkBuildOutput = new Artifact("BuildOutput")
    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({

          actionName: "CDK_Build",
          input: cdkSourceOutput,
          outputs: [cdkBuildOutput],
          project: new PipelineProject(this, "CdkBuildProject", {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromSourceFilename(
              "build-specs/cdk-build-spec.yml"
            ),
          }),
        }),
      ]
    })
    const testOutput=new Artifact("testArtifact")
    pipeline.addStage(
      {
        stageName: 'Test',
        actions: [
          new CodeBuildAction({
            actionName: 'Test',
            project: new PipelineProject(this, "CdkBuildProject1", {
              environment: {
                buildImage: LinuxBuildImage.STANDARD_5_0,
              },
              buildSpec: BuildSpec.fromSourceFilename(
                "build-specs/cdk-newman-spec.yml"
              ),
            }),
            input: cdkBuildOutput,
            outputs:[testOutput]
          }),
        ],
      },
    )
    pipeline.addStage({
      stageName:"update",
      actions:[
        new CloudFormationCreateUpdateStackAction({
          actionName:"PipelineUpdate",
          stackName:"NewmanStack",
          templatePath:cdkBuildOutput.atPath("NewmanStack.template.json"),
          adminPermissions:true
        })
      ]
    })
    
  }
  //////////////////


}
