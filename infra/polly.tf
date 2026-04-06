# Polly IAM policy for Lambda
# polly:SynthesizeSpeech does not support resource-level permissions.
# Resource="*" is required per AWS documentation.
resource "aws_iam_role_policy" "lambda_api_polly" {
  name = "${var.project}-lambda-api-polly"
  role = aws_iam_role.lambda_api.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "polly:SynthesizeSpeech"
        Resource = "*"
      }
    ]
  })
}
