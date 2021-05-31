<?php

namespace App\Queries;

use App\Models\Role;

/**
 * Class RoleDataTable
 */
class RoleDataTable
{
    /**
     * @return Role|\Illuminate\Database\Eloquent\Builder
     */
    public function get()
    {
        return Role::query();
    }
}