#!/bin/bash

# args: url, branches, local destination directory for repo, file to clone
function git-clone-dir() ( 
    url="$1"
    dest_dir="$2"
    cln_targ="$3"
    declare -a branches=("${!4}")

    
    mkdir -p "$dest_dir"
    cd "$dest_dir"  
    git init
    git remote add origin "$url"    
    git config core.sparseCheckout true 
    echo "$cln_targ" >> .git/info/sparse-checkout


    for br in "${branches[@]}"
    do
        git fetch --jobs=8 --depth=1 origin "$br"
        if [[ $? -ne 0 ]] ; then
            return 1
        fi
    done
    cd ..
    return 0
)

#args: repo directory, path to file in repo, branches
function copy-file-from-repo(){
    path_to_repo="$1"
    path_to_file="$2"
    declare -a branches=("${!3}")
    mkdir docs
    cd "$path_to_repo"

    for branch in "${branches[@]}"
    do
        IFS='/' read -r tmp version <<< "$branch"
        git checkout "$branch"
        version="docs/$version"
        cp "$path_to_file" "../$version.rst"
        echo "File for versioin $version copied"
    done
    cd ..
}



llvm_repo_url="https://github.com/llvm/llvm-project.git"
declare -a versions=("release/13.x" "release/12.x" "release/11.x" "release/10.x" \
"release/9.x")
clone_target="clang/docs/ClangFormatStyleOptions.rst"
local_repo_dir="temp-llvm-repo" 


function get-docs(){
    echo "Cloning repo"
    git-clone-dir "$llvm_repo_url" "$local_repo_dir" "$clone_target" versions[@]
    if [[ $? -ne 0 ]] ; then
        echo "Failed to fetch"
        return 1
    else 
        echo "Cloned required branches, copying doc file" 
    fi
    copy-file-from-repo "$local_repo_dir" "$clone_target" versions[@]
    if [[ $? -ne 0 ]] ; then
        echo "Failed to copy doc files"
        return 1
    else 
        echo "Done."
    fi
    rm -rf "$local_repo_dir"
}


declare -a llvm_links=(\
    'https://github.com/llvm/llvm-project/releases/download/llvmorg-10.0.1/clang+llvm-10.0.1-x86_64-linux-gnu-ubuntu-16.04.tar.xz')

function download-clang-10(){
    cntr=10
    mkdir clang
    for lnk in "${llvm_links[@]}"
    do
       wget -O clangtar.tar.xz "$lnk"
       mkdir -p "clang/clang_$cntr" && tar xvf clangtar.tar.xz -C "clang/clang_$cntr" --strip-components 1
       ((cntr=cntr-1))
       rm clangtar.tar.xz
    done
    
}


declare -a styles=(\
    'LLVM' 'Google' 'Chromium' 'Mozilla' 'WebKit' 'Microsoft' 'GNU')
function dump-configs(){
    mkdir dumps
    for style in "${styles[@]}"
    do
        clang-format-13 --style="$style" --dump-config > dumps/clang-format-13_"$style"
        clang-format-12 --style="$style" --dump-config > dumps/clang-format-12_"$style"
        clang-format-11 --style="$style" --dump-config > dumps/clang-format-11_"$style"
        clang-format-10 --style="$style" --dump-config > dumps/clang-format-10_"$style"
        clang-format-9 --style="$style" --dump-config > dumps/clang-format-9_"$style"
    done
}


 function get-configs(){
    docker build . -t conf-dumps
    docker rm conf-dumps-cont
    docker create -ti --name conf-dumps-cont conf-dumps bash
    docker cp conf-dumps-cont:/dumps/ ./defaults

 }



workdir="$(pwd)"
if [ "$(basename $workdir)" != "llvm" ] &&  [ "$1" != "dump" ]
then
    echo "launch script from llvm directory"
    exit 1
fi

if [[ "$1" = "docs" ]] ; then
    get-docs
elif [[ "$1" = "download-clang" ]] ; then
    download-clang-10
elif [[ "$1" = "dump" ]] ; then 
    #he bought? Dump it.
    dump-configs
elif [[ "$1" = "get-configs" ]] ; then
    get-configs
else 
    echo "First and only arg is either \"docs\" to get docs from repos\
    or \"download-clang\" to download clang-10 or \"get-configs\" to get style configs from docker";
fi

