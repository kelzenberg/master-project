script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
folder_path="$script_dir/src/cert"

generate_local_certs() {
  echo "Generating local self-signed certificate files in '$folder_path'.\nPlease follow instructions.\n"

  mkdir -p $folder_path
  openssl genrsa 1024 >$folder_path/file.pem
  openssl req -new -key $folder_path/file.pem -out $folder_path/csr.pem
  openssl x509 -req -days 365 -in $folder_path/csr.pem -signkey $folder_path/file.pem -out $folder_path/file.crt

  echo "\nLocal self-signed certificate files generated. DO NOT USE THESE IN PRODUCTION!"
}

generate_local_certs
