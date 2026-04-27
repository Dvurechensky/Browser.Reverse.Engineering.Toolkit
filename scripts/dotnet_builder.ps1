# .\dotnet_builder.ps1 -Project Vk -Run

param(
    [string]$Project = "Vk",
    [switch]$Run
)

$files = Get-ChildItem -Filter "swagger-*.json" |
Where-Object {
    $_.BaseName -notmatch '\.'
}

$port = 5100

foreach ($file in $files)
{
    $suffix = $file.BaseName.Replace("swagger-", "")
    $suffix = (Get-Culture).TextInfo.ToTitleCase($suffix)

    $name = "$Project$suffix"

    Write-Host "Generating $name from $($file.Name)"

    $args = @(
        "generate"
        $file.FullName
        "--name"
        $name
        "--port"
        $port
    )

    if ($Run)
    {
        $args += "--run"
    }

    & .\Dotnetify.exe $args

    $port++
}