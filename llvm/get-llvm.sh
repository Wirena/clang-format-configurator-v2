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
        cp "$path_to_file" ../"$version"
        echo "File for versioin $version copied"
    done
    cd ..
}



llvm_repo_url="https://github.com/llvm/llvm-project.git"
declare -a versions=("release/13.x" "release/12.x" "release/11.x" "release/10.x"\
"release/9.x" "release/8.x" "release/7.x" "release/6.x" "release/5.x" "release/4.x")
clone_target="clang/docs/ClangFormatStyleOptions.rst"
local_repo_dir="temp-llvm-repo" 


function clean(){
    rm -rf "$local_repo_dir"
    rm -rf "docs"
}

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
    
}


if [[ "$1" = "clean" ]] ; then
    clean
elif [[ "$1" = "get-docs" ]] ; then
    get
else 
    echo "First and only arg is either \"clean\" to cleanup or \"get-docs\" to get docs from repos"
fi