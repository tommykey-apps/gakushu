# Route53 hosted zone for gakushu.now
# ドメイン購入時に自動作成された hosted zone を参照（Terraform で新規作成しない）
data "aws_route53_zone" "main" {
  name = var.domain
}

# gakushu.now -> CloudFront
resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}

# ACM DNS validation records
# gakushu.now と *.gakushu.now は同じ CNAME を共有するので domain_name で重複排除
locals {
  acm_validation_options = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    } if dvo.domain_name == var.domain
  }
}

resource "aws_route53_record" "acm_validation" {
  for_each = local.acm_validation_options

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}
