# Bedrock IAM policy for Lambda
resource "aws_iam_role_policy" "lambda_api_bedrock" {
  name = "${var.project}-lambda-api-bedrock"
  role = aws_iam_role.lambda_api.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ]
        Resource = "arn:aws:bedrock:${var.region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      }
    ]
  })
}
