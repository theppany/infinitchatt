<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use App\Queries\RoleDataTable;
use App\Repositories\RoleRepository;
use DataTables;
use Exception;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class RoleController extends AppBaseController
{
    /** @var  RoleRepository */
    private $roleRepository;

    public function __construct(RoleRepository $roleRepo)
    {
        $this->roleRepository = $roleRepo;
    }

    /**
     * @param  Request  $request
     *
     * @throws Exception
     *
     * @return Factory|View
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return Datatables::of((new RoleDataTable())->get())->make(true);
        }

        return view('roles.index');
    }

    /**
     * @return Factory|View
     */
    public function create()
    {
        return view('roles.create');
    }

    /**
     * @param  CreateRoleRequest  $request
     *
     * @return JsonResponse
     */
    public function store(CreateRoleRequest $request)
    {
        $input = $request->all();

        $this->roleRepository->create($input);

        return $this->sendSuccess('Role saved successfully.');
    }

    /**
     * @param  Role  $role
     *
     * @return JsonResponse
     */
    public function show(Role $role)
    {
        return $this->sendResponse($role, 'Role retrieved successfully');
    }

    /**
     * @param  Role  $role
     *
     * @return JsonResponse
     */
    public function edit(Role $role)
    {
        return $this->sendResponse($role, 'Role retrieved successfully');
    }

    /**
     * @param  Role  $role
     * @param  UpdateRoleRequest  $request
     *
     * @return JsonResponse
     */
    public function update(Role $role, UpdateRoleRequest $request)
    {
        if ($role->is_default) {
            return $this->sendError('You can not delete default role.');
        }
        $this->roleRepository->update($request->all(), $role->id);

        return $this->sendSuccess('Role updated successfully.');
    }

    /**
     * @param  Role  $role
     * @param  Request  $request
     *
     * @throws Exception
     *
     * @return JsonResponse
     */
    public function destroy(Role $role, Request $request)
    {
        if ($role->is_default) {
            return $this->sendError('You can not delete default role.');
        }
        if ($role->users->count() > 0) {
            return $this->sendError('This role is already assigned.');
        }
        $this->roleRepository->delete($role->id);

        return $this->sendSuccess('Role deleted successfully');
    }
}
