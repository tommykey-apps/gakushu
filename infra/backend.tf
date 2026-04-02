terraform {
  backend "s3" {
    bucket         = "tommykeyapp-tfstate"
    key            = "gakushu/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
